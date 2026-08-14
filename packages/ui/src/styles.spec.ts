import fs from 'node:fs'
import path from 'node:path'
import { breakpoint, icon, size } from '@church/tokens'
import postcss, { AtRule, Root, Rule } from 'postcss'
import { compile } from 'tailwindcss'
import {
  RADIO_TOUCH_ROW,
  RADIO_TOUCH_ROW_LARGE
} from './components/atoms/Radio/data'
import { AUTO_GAP } from './components/atoms/Stack/data'
import { TOGGLE_TOUCH_ROW } from './components/atoms/Toggle/data'
import { DAY_SIZE } from './components/molecules/DatePicker/data'
import { OPTIONS_GAP } from './components/molecules/RadioGroup/data'
import {
  SHEET_FADE,
  SHEET_SLIDE
} from './components/organisms/BottomSheet/data'
import {
  DIALOG_BODY_DENSITY,
  DIALOG_FOOTER_DENSITY,
  DIALOG_HEADER_DENSITY
} from './components/organisms/Dialog/data'
import {
  CHIP_LIST_DENSITY,
  CHIPS_ROW_DENSITY,
  COUNT_DENSITY,
  SEARCH_DENSITY
} from './components/organisms/FilterBar/data'
import { SKELETON_PULSE } from './components/organisms/List/data'
import { twMerge } from './lib/tailwind-merge'

// why: jsdom has no cascade and no var() resolution, so these specs compile
// the real `styles.css` with Tailwind and resolve each utility's var() chain
// per theme, the way a browser would at the root element.
const uiRoot = path.resolve(__dirname, '..')

const findPackageDir = (name: string) => {
  for (let dir = uiRoot; dir !== path.dirname(dir); dir = path.dirname(dir)) {
    const candidate = path.join(dir, 'node_modules', name)
    if (fs.existsSync(path.join(candidate, 'package.json'))) return candidate
  }
  throw new Error(`${name} is not installed`)
}

const exportTarget = (exportsField: unknown, subpath: string) => {
  if (typeof exportsField !== 'object' || exportsField === null) return
  const entry: unknown = Object.entries(exportsField).find(
    ([key]) => key === subpath
  )?.[1]
  if (typeof entry === 'string') return entry
  if (typeof entry !== 'object' || entry === null) return
  const style = Object.entries(entry).find(([key]) => key === 'style')?.[1]
  return typeof style === 'string' ? style : undefined
}

// hazard: Jest's resolver (even through createRequire) applies the `\.css$`
// moduleNameMapper stub, so package stylesheets are resolved by hand here.
const resolveStylesheet = (id: string, base: string) => {
  if (id.startsWith('.')) return path.resolve(base, id)
  const parts = id.split('/')
  const nameLength = id.startsWith('@') ? 2 : 1
  const dir = findPackageDir(parts.slice(0, nameLength).join('/'))
  const subpath = ['.', ...parts.slice(nameLength)].join('/')
  const manifest: unknown = JSON.parse(
    fs.readFileSync(path.join(dir, 'package.json'), 'utf8')
  )
  const exportsField =
    typeof manifest === 'object' && manifest !== null && 'exports' in manifest
      ? manifest.exports
      : undefined
  const target = exportTarget(exportsField, subpath)
  if (!target) throw new Error(`${id} is not an exported stylesheet`)
  return path.join(dir, target)
}

const buildCss = async (candidates: string[]) => {
  const compiler = await compile(
    "@import 'tailwindcss';\n@import './src/styles.css';",
    {
      base: uiRoot,
      loadStylesheet: async (id, base) => {
        const file = resolveStylesheet(id, base)
        return {
          path: file,
          base: path.dirname(file),
          content: fs.readFileSync(file, 'utf8')
        }
      }
    }
  )
  return postcss.parse(compiler.build(candidates))
}

type Scope = Map<string, string>

const collectScopes = (root: Root) => {
  const light: Scope = new Map()
  const darkOverrides: Scope = new Map()
  root.walkRules(rule => {
    const isRoot = rule.selectors.some(s => s === ':root' || s === ':host')
    const isDark = rule.selectors.includes("[data-theme='dark']")
    const target = isRoot ? light : isDark ? darkOverrides : undefined
    if (!target) return
    rule.each(node => {
      if (node.type === 'decl' && node.prop.startsWith('--'))
        target.set(node.prop, node.value)
    })
  })
  return { light, dark: new Map([...light, ...darkOverrides]) }
}

const VAR = /var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)/

const resolveValue = (value: string, scope: Scope): string => {
  let current = value
  for (let depth = 0; depth < 25 && VAR.test(current); depth++) {
    current = current.replace(VAR, (_, name: string, fallback?: string) => {
      const next = scope.get(name) ?? fallback
      if (next === undefined) throw new Error(`${name} is not defined`)
      return next.trim()
    })
  }
  return current
}

const declOf = (root: Root, selector: string, prop: string) => {
  let found: string | undefined
  root.walkRules(rule => {
    if (rule.selector !== selector) return
    rule.walkDecls(prop, decl => {
      found = decl.value
    })
  })
  if (found === undefined) throw new Error(`${selector} has no ${prop}`)
  return found
}

const SEMANTIC: ReadonlyArray<[string, string, string, string]> = [
  ['text-primary', 'color', '#27272F', '#FFFFFF'],
  ['text-secondary', 'color', '#686F7A', '#C1C8D3'],
  ['text-disabled', 'color', '#A3ACBD', '#868F9D'],
  ['text-inverse', 'color', '#FFFFFF', '#27272F'],
  ['text-link', 'color', '#2558A1', '#84B7FF'],
  ['text-danger', 'color', '#AA2511', '#F99D8F'],
  ['text-positive', 'color', '#1F7534', '#5BD279'],
  ['text-attention', 'color', '#5B4801', '#FFDF6D'],
  ['text-accent', 'color', '#3175D4', '#4994FF'],
  ['text-on-accent', 'color', '#FFFFFF', '#27272F'],
  ['text-on-positive', 'color', '#FFFFFF', '#27272F'],
  ['text-on-danger', 'color', '#FFFFFF', '#27272F'],
  ['text-on-attention', 'color', '#27272F', '#FFFFFF'],
  ['bg-page', 'background-color', '#F0F0F2', '#101015'],
  ['bg-surface', 'background-color', '#FEFEFE', '#27272F'],
  ['bg-hover', 'background-color', '#A2ACBD1A', '#A2ACBD1A'],
  ['bg-selected', 'background-color', '#A2ACBD33', '#A2ACBD33'],
  ['bg-disabled', 'background-color', '#DEE1E8', '#474B53'],
  ['bg-action-primary', 'background-color', '#27272F', '#FFFFFF'],
  ['bg-accent-solid', 'background-color', '#3175D4', '#4994FF'],
  ['bg-positive-solid', 'background-color', '#1F7534', '#5BD279'],
  ['bg-danger-solid', 'background-color', '#E03116', '#F56752'],
  ['bg-attention-solid', 'background-color', '#F4BF01', '#886A01'],
  ['bg-accent-subtle', 'background-color', '#3388FF1A', '#3388FF1A'],
  ['bg-positive-subtle', 'background-color', '#16CA441A', '#16CA441A'],
  ['bg-danger-subtle', 'background-color', '#FF4E331A', '#FF4E331A'],
  ['bg-attention-subtle', 'background-color', '#FFC9001A', '#FFC9001A'],
  ['bg-scrim', 'background-color', '#27272F99', '#27272F99'],
  ['border-default', 'border-color', '#DEE1E8', '#474B53'],
  ['border-control', 'border-color', '#868F9D', '#A3ACBD'],
  ['outline-focus-ring', 'outline-color', '#27272F', '#FFFFFF'],
  ['text-brand-red', 'color', '#EF2F29', '#EF2F29'],
  ['text-brand-blue', 'color', '#3255AE', '#3255AE'],
  ['text-brand-teal', 'color', '#46C0A3', '#46C0A3'],
  ['fill-brand-red', 'fill', '#EF2F29', '#EF2F29'],
  ['fill-brand-blue', 'fill', '#3255AE', '#3255AE'],
  ['fill-brand-teal', 'fill', '#46C0A3', '#46C0A3']
]

const ELEVATION: ReadonlyArray<[string, string]> = [
  ['low-bottom-12', '0px 8px 12px 0 #00000014'],
  ['low-low-above', '0px -8px 12px 0 #00000014'],
  ['low-low-left', '-8px 0px 12px 0 #00000014'],
  ['low-low-right', '8px 0px 12px 0 #00000014'],
  ['low-bottom-24', '0px 16px 24px 0 #00000029'],
  ['low-above', '0px -16px 24px 0 #00000029'],
  ['low-left', '-16px 0px 24px 0 #00000029'],
  ['low-right', '16px 0px 24px 0 #00000029'],
  ['high-bottom', '0px 12px 40px 0 #0000001F'],
  ['high-above', '0px -12px 40px 0 #0000001F'],
  ['high-left', '-12px 0px 40px 0 #0000001F'],
  ['high-right', '12px 0px 40px 0 #0000001F'],
  ['deep-high-bottom', '0px 24px 48px 0 #0000003D'],
  ['deep-high-above', '0px -24px 48px 0 #0000003D'],
  ['deep-high-left', '-24px 0px 48px 0 #0000003D'],
  ['deep-high-right', '24px 0px 48px 0 #0000003D']
]

// invariant: criteria 7, 18, 26, 27 and 31 of `.tasks/lamb-overlays.md` as
// resolved CSS, written apart from the `@theme` values they check.
const OVERLAY_GEOMETRY: ReadonlyArray<[string, string, string]> = [
  ['max-h-dialog', 'max-height', 'calc(100% - 16px)'],
  ['w-drawer', 'width', '650px'],
  ['max-w-drawer-modal', 'max-width', 'calc(100% - 48px)'],
  ['max-h-sheet', 'max-height', 'calc(100% - 24px)'],
  ['h-sheet', 'height', 'calc(100% - 24px)'],
  ['h-safe-area', 'height', 'env(safe-area-inset-bottom, 0px)']
]

// invariant: criterion 1 of `.tasks/lamb-page-shell.md` as resolved CSS,
// written apart from the `@theme` values and the tokens they check.
const LAYOUT_SIZES: ReadonlyArray<[string, string, string]> = [
  ['w-sidebar', 'width', '240px'],
  ['w-sidebar-collapsed', 'width', '64px'],
  ['max-w-content-max', 'max-width', '1440px'],
  ['w-menu-drawer', 'width', '390px'],
  ['w-drawer', 'width', '650px']
]

// invariant: the literal classes that List.spec (C47) and Select.spec (C7)
// assert on the components; compiled here to prove their selectors.
const LIST_SECTION_GAP = '[[data-list-section]+&]:mt-2'
const SELECT_FOCUS_VARIANT = 'has-[[role=combobox]:focus-visible]:'
const SELECT_OPEN_RING = ['border-focus-ring', 'ring-1', 'ring-focus-ring']

let css: Root
let scopes: ReturnType<typeof collectScopes>

beforeAll(async () => {
  css = await buildCss([
    ...SEMANTIC.map(([utility]) => utility),
    ...ELEVATION.map(([name]) => `shadow-elevation-${name}`),
    'font-sans',
    'animate-spinner',
    ...Object.values(AUTO_GAP).flatMap(classes => classes.split(' ')),
    ...[
      RADIO_TOUCH_ROW,
      RADIO_TOUCH_ROW_LARGE,
      ...Object.values(OPTIONS_GAP),
      TOGGLE_TOUCH_ROW
    ].flatMap(classes => classes.split(' ')),
    'after:h-11',
    'after:w-11',
    'after:w-13',
    ...DAY_SIZE.split(' '),
    'text-icon-32',
    'text-icon-48',
    ...[
      DIALOG_HEADER_DENSITY,
      DIALOG_BODY_DENSITY,
      DIALOG_FOOTER_DENSITY,
      SHEET_FADE,
      SHEET_SLIDE
    ].flatMap(classes => classes.split(' ')),
    'pb-2',
    'pt-2',
    ...OVERLAY_GEOMETRY.map(([utility]) => utility),
    ...LAYOUT_SIZES.map(([utility]) => utility),
    'transition-width',
    'grid-cols-fill-55',
    ...[
      SEARCH_DENSITY,
      COUNT_DENSITY,
      CHIPS_ROW_DENSITY,
      CHIP_LIST_DENSITY,
      SKELETON_PULSE
    ].flatMap(classes => classes.split(' ')),
    LIST_SECTION_GAP,
    ...['outline-2', 'outline-offset-2', 'outline-focus-ring'].map(
      utility => `${SELECT_FOCUS_VARIANT}${utility}`
    ),
    ...SELECT_OPEN_RING
  ])
  scopes = collectScopes(css)
})

// invariant: criteria 48/49 of `.tasks/lamb-atoms.md` as [App px, Painel px],
// written apart from `AUTO_GAP` so a typo in the class table fails here.
const AUTO_MATRIX_PX: Record<string, [number, number]> = {
  'primitive-strong': [8, 8],
  'primitive-strong-interactive': [12, 8],
  'primitive-weak': [16, 16],
  'primitive-none': [32, 24],
  'composite-strong': [16, 12],
  'composite-weak': [24, 16],
  'composite-none': [32, 24],
  'block-strong': [24, 16],
  'block-weak': [32, 16],
  'block-weak-bare': [32, 24],
  'block-none': [32, 24]
}

const escapeClass = (name: string) => name.replace(/[:[\]=.*/]/g, m => `\\${m}`)

const ruleFor = (root: Root, className: string) => {
  const selector = `.${escapeClass(className)}`
  let found: Rule | undefined
  root.walkRules(rule => {
    if (rule.selectors.some(s => s.includes(selector))) found = rule
  })
  if (!found) throw new Error(`no rule for ${className}`)
  return found
}

// why: `ruleFor` does not escape `+`, `&` or `(`, so arbitrary variants are
// found by the unescaped selector instead.
const ruleForArbitrary = (root: Root, className: string) => {
  let found: Rule | undefined
  root.walkRules(rule => {
    if (rule.selector.replace(/\\(.)/g, '$1').includes(`.${className}`))
      found = rule
  })
  if (!found) throw new Error(`no rule for ${className}`)
  return found
}

const gapOf = (rule: Rule) => {
  let gap: string | undefined
  rule.walkDecls('gap', decl => {
    gap = decl.value
  })
  return gap
}

const enclosingMedia = (rule: Rule) =>
  rule.parent instanceof AtRule && rule.parent.name === 'media'
    ? rule.parent.params
    : undefined

const sourceIndex = (root: Root, target: Rule) => {
  let index = -1
  let i = 0
  root.walkRules(rule => {
    if (rule === target) index = i
    i++
  })
  return index
}

const PANEL_PREFIX = 'panel:not-in-data-[viewport=mobile]:'
const DESKTOP_PREFIX = 'in-data-[viewport=desktop]:'

const declIn = (rule: Rule, prop: string) => {
  let value: string | undefined
  rule.walkDecls(prop, decl => {
    value = decl.value
  })
  return value
}

const spacingPx = (value: string | undefined) => {
  const match = value?.match(/^calc\(var\(--spacing\) \* ([\d.]+)\)$/)
  if (match) return Number(match[1]) * 4
  if (value === '0' || value === '0px') return 0
  throw new Error(`${value} is not a spacing value`)
}

// why: resolves one property of a density class list (base = App, `panel:`
// and `[data-viewport]` = Painel) to px, keeping the selectors to assert.
const densityOf = (classes: string, prop: string) => {
  const tokens = classes.split(' ')
  const pick = (matches: (token: string) => boolean) =>
    tokens
      .filter(matches)
      .map(token => ruleFor(css, token))
      .find(rule => declIn(rule, prop) !== undefined)
  const app = pick(token => !token.includes(':'))
  const panel = pick(token => token.startsWith(PANEL_PREFIX))
  const desktop = pick(token => token.startsWith(DESKTOP_PREFIX))
  if (!app) throw new Error(`${classes} sets no App ${prop}`)
  return {
    app,
    appPx: spacingPx(declIn(app, prop)),
    desktop,
    desktopPx: desktop ? spacingPx(declIn(desktop, prop)) : undefined,
    panel,
    panelPx: panel ? spacingPx(declIn(panel, prop)) : undefined
  }
}

const expectAutoDensity = (
  density: ReturnType<typeof densityOf>,
  [appPx, panelPx]: [number, number]
) => {
  const { app, desktop, panel } = density

  expect(density.appPx).toBe(appPx)
  expect(enclosingMedia(app)).toBeUndefined()
  if (!panel || !desktop) throw new Error('missing a Painel class')
  expect(density.panelPx).toBe(panelPx)
  expect(enclosingMedia(panel)).toBe('(width >= 60rem)')
  expect(panel.selector).toContain(':not(:where([data-viewport="mobile"]) *)')
  expect(density.desktopPx).toBe(panelPx)
  expect(enclosingMedia(desktop)).toBeUndefined()
  expect(desktop.selector).toContain(':where([data-viewport="desktop"])')
  expect(sourceIndex(css, desktop)).toBeGreaterThan(sourceIndex(css, app))
}

// invariant: criteria 40, 41, 43 and 44 of `.tasks/lamb-molecules.md` as
// [App px, Painel px], written apart from the class tables they check.
const TOUCH_DENSITY_PX: ReadonlyArray<
  [string, () => string, string, [number, number]]
> = [
  ['radio row min-height', () => RADIO_TOUCH_ROW, 'min-height', [44, 0]],
  ['radio row padding', () => RADIO_TOUCH_ROW, 'padding-block', [10, 0]],
  [
    'large radio row padding',
    () => twMerge(RADIO_TOUCH_ROW, RADIO_TOUCH_ROW_LARGE),
    'padding-block',
    [6, 0]
  ],
  ['default options gap', () => OPTIONS_GAP.default, 'row-gap', [0, 12]]
]

describe('styles.css', () => {
  it.each(SEMANTIC)(
    'semantic utilities resolve light values: %s',
    (utility, prop, light) => {
      const value = declOf(css, `.${utility}`, prop)

      expect(resolveValue(value, scopes.light).toUpperCase()).toBe(light)
    }
  )

  it.each(SEMANTIC)(
    'semantic utilities resolve dark values: %s',
    (utility, prop, _light, dark) => {
      const value = declOf(css, `.${utility}`, prop)

      expect(resolveValue(value, scopes.dark).toUpperCase()).toBe(dark)
    }
  )

  it.each(ELEVATION)('elevation shadows match tokens: %s', (name, literal) => {
    const selector = `.shadow-elevation-${name}`

    expect(declOf(css, selector, 'box-shadow')).toContain('var(--tw-shadow)')
    expect(
      resolveValue(declOf(css, selector, '--tw-shadow'), scopes.light)
    ).toBe(literal)
  })

  describe('font-sans is Inter', () => {
    it('maps the sans family to the Inter variable and applies it to body', () => {
      expect(scopes.light.get('--font-sans')).toBe('var(--font-inter)')
      expect(declOf(css, '.font-sans', 'font-family')).toBe('var(--font-sans)')
      expect(declOf(css, 'body', 'font-family')).toBe('var(--font-sans)')
    })

    it.each([
      ['apps/web', '../../apps/web/app/layout.tsx'],
      ['storybook', '.storybook/decorators.tsx']
    ])('loads Inter as --font-inter in %s', (_assembly, file) => {
      const source = fs.readFileSync(path.join(uiRoot, file), 'utf8')

      expect(source).toMatch(
        /import \{[^}]*\bInter\b[^}]*\} from 'next\/font\/google'/
      )
      expect(source).toContain("variable: '--font-inter'")
      expect(source).not.toMatch(/noto/i)
    })
  })

  it('focus-visible ring draws a 2px focus-ring outline offset by 2px', () => {
    const outline = declOf(css, ':focus-visible', 'outline')

    expect(outline).toBe('2px solid var(--color-focus-ring)')
    expect(declOf(css, ':focus-visible', 'outline-offset')).toBe('2px')
    expect(resolveValue(outline, scopes.light)).toBe('2px solid #27272F')
    expect(resolveValue(outline, scopes.dark)).toBe('2px solid #FFFFFF')
    expect(declOf(css, ':focus:not(:focus-visible)', 'outline')).toBe('none')
  })

  it('reduced motion caps transitions and animations at 0.01ms', () => {
    const durations: Record<string, { value: string; important: boolean }> = {}
    css.walkAtRules('media', media => {
      if (!/prefers-reduced-motion:\s*reduce/.test(media.params)) return
      media.walkRules(rule => {
        if (!rule.selectors.includes('*')) return
        rule.walkDecls(/-duration$/, decl => {
          durations[decl.prop] = {
            value: decl.value,
            important: Boolean(decl.important)
          }
        })
      })
    })

    expect(durations['transition-duration']).toEqual({
      value: '0.01ms',
      important: true
    })
    expect(durations['animation-duration']).toEqual({
      value: '0.01ms',
      important: true
    })
  })

  it('disabled cursor is not-allowed for every disabled control', () => {
    const disabledCursors: string[] = []
    css.walkRules(rule => {
      if (!rule.selector.includes(':disabled')) return
      if (rule.selector.includes(':not(:disabled)')) return
      rule.walkDecls('cursor', decl => {
        disabledCursors.push(decl.value)
      })
    })

    expect(declOf(css, ":disabled, [aria-disabled='true']", 'cursor')).toBe(
      'not-allowed'
    )
    expect(disabledCursors.length).toBeGreaterThan(0)
    expect(disabledCursors.every(value => value === 'not-allowed')).toBe(true)
  })

  it('spinner spins in 0.8s (C5)', () => {
    const animation = declOf(css, '.animate-spinner', 'animation')
    let rotate: string | undefined
    css.walkAtRules('keyframes', keyframes => {
      if (keyframes.params !== 'spinner') return
      keyframes.walkDecls('transform', decl => {
        rotate = decl.value
      })
    })

    expect(resolveValue(animation, scopes.light)).toBe(
      'spinner 0.8s linear infinite'
    )
    expect(rotate).toBe('rotate(360deg)')
  })

  it('spinner keeps turning under reduced motion (C7)', () => {
    const decls: Record<string, { value: string; important: boolean }> = {}
    let globalIndex = -1
    let spinnerIndex = -1
    css.walkAtRules('media', media => {
      if (!/prefers-reduced-motion:\s*reduce/.test(media.params)) return
      media.walkRules(rule => {
        if (rule.selectors.includes('*')) globalIndex = sourceIndex(css, rule)
        if (!rule.selectors.includes('[data-spinner]')) return
        spinnerIndex = sourceIndex(css, rule)
        rule.walkDecls(decl => {
          decls[decl.prop] = {
            value: decl.value,
            important: Boolean(decl.important)
          }
        })
      })
    })

    expect(decls['animation-duration']).toEqual({
      value: '2.4s',
      important: true
    })
    expect(decls['animation-iteration-count']).toEqual({
      value: 'infinite',
      important: true
    })
    // invariant: same layer and later than the `*` rule, so it wins the tie.
    expect(spinnerIndex).toBeGreaterThan(globalIndex)
  })

  it('panel breakpoint matches the token (C48)', () => {
    const rem = `${breakpoint.panel / 16}rem`
    const rule = ruleFor(css, 'panel:not-in-data-[viewport=mobile]:gap-4')

    expect(breakpoint.panel).toBe(960)
    expect(enclosingMedia(rule)).toBe(`(width >= ${rem})`)
  })

  it.each(Object.entries(AUTO_GAP))(
    'stack auto density resolves in CSS (C52): %s',
    (key, classes) => {
      const [app, panel, desktop] = classes.split(' ')
      const base = ruleFor(css, app)
      const [appPx, panelPx] = AUTO_MATRIX_PX[key] ?? []

      expect(gapOf(base)).toBe(`calc(var(--spacing) * ${(appPx ?? 0) / 4})`)
      expect(gapOf(ruleFor(css, panel ?? app))).toBe(
        `calc(var(--spacing) * ${(panelPx ?? 0) / 4})`
      )
      expect(enclosingMedia(base)).toBeUndefined()
      if (!panel || !desktop) return

      const wide = ruleFor(css, panel)
      const forcedDesktop = ruleFor(css, desktop)
      const panelGap = gapOf(wide)

      expect(enclosingMedia(wide)).toBe('(width >= 60rem)')
      expect(wide.selector).toContain(
        ':not(:where([data-viewport="mobile"]) *)'
      )
      expect(forcedDesktop.selector).toContain(
        ':where([data-viewport="desktop"])'
      )
      expect(enclosingMedia(forcedDesktop)).toBeUndefined()
      expect(gapOf(forcedDesktop)).toBe(panelGap)
      expect(gapOf(base)).not.toBe(panelGap)
      expect(sourceIndex(css, forcedDesktop)).toBeGreaterThan(
        sourceIndex(css, base)
      )
    }
  )

  it.each(TOUCH_DENSITY_PX)(
    'radio density resolves in CSS (C42): %s',
    (_name, classes, prop, expected) => {
      expectAutoDensity(densityOf(classes(), prop), expected)
    }
  )

  it('radio density resolves in CSS (C42): card options keep 8px', () => {
    const card = densityOf(OPTIONS_GAP.card, 'gap')

    expect(card.appPx).toBe(8)
    expect(enclosingMedia(card.app)).toBeUndefined()
    expect(card.panel).toBeUndefined()
    expect(card.desktop).toBeUndefined()
  })

  it('toggle row height resolves in CSS (C44)', () => {
    expectAutoDensity(densityOf(TOGGLE_TOUCH_ROW, 'min-height'), [44, 0])
  })

  it.each([
    ['after:h-11', 'height', 44],
    ['after:w-11', 'width', 44],
    ['after:w-13', 'width', 52]
  ] as const)(
    'toggle row height resolves in CSS (C44): track touch area %s in any density',
    (utility, prop, px) => {
      const rule = ruleFor(css, utility)

      expect(spacingPx(declIn(rule, prop))).toBe(px)
      expect(enclosingMedia(rule)).toBeUndefined()
      expect(rule.selector).not.toContain('data-viewport')
    }
  )

  // invariant: criterion 86 of `.tasks/lamb-molecules.md` as [App px, Painel
  // px], written apart from `DAY_SIZE`.
  it.each(['width', 'height'])(
    'datepicker day size resolves in CSS (C87): %s',
    prop => {
      expectAutoDensity(densityOf(DAY_SIZE, prop), [44, 40])
    }
  )

  it.each([
    [32, 'text-icon-32'],
    [48, 'text-icon-48']
  ] as const)('icon sizes 32 and 48 (C101): %s', (px, utility) => {
    const fontSize = declIn(ruleFor(css, utility), 'font-size')

    expect(icon.size[px]).toBe(px)
    expect(fontSize).toBeDefined()
    expect(resolveValue(fontSize ?? '', scopes.light)).toBe(`${px}px`)
  })

  // why: a `calc(var(--spacing) * n)` resolves to `0.25rem * n`; this turns
  // it into px so the expected values read as the task writes them.
  const remToPx = (value: string) =>
    value.replace(
      /([\d.]+)rem \* ([\d.]+)/g,
      (_, rem: string, steps: string) => `${Number(rem) * 16 * Number(steps)}px`
    )

  it.each(OVERLAY_GEOMETRY)(
    'overlay geometry resolves in CSS (C7, C18, C26, C27, C31): %s',
    (utility, prop, expected) => {
      const rule = ruleFor(css, utility)
      const value = declIn(rule, prop)

      expect(value).toBeDefined()
      expect(remToPx(resolveValue(value ?? '', scopes.light))).toBe(expected)
      expect(enclosingMedia(rule)).toBeUndefined()
    }
  )

  it('layout size tokens (C1)', () => {
    expect(size).toEqual({
      drawer: 650,
      sidebar: 240,
      sidebarCollapsed: 64,
      contentMax: 1440,
      menuDrawer: 390
    })
    for (const [utility, prop, expected] of LAYOUT_SIZES) {
      // why: `ruleFor` matches by substring, and `.w-sidebar` is a prefix of
      // `.w-sidebar-collapsed`; this needs the exact selector.
      let found: Rule | undefined
      css.walkRules(candidate => {
        if (candidate.selectors.includes(`.${escapeClass(utility)}`))
          found = candidate
      })
      if (!found) throw new Error(`no rule for ${utility}`)
      const rule: Rule = found
      const value = declIn(rule, prop)

      expect(utility).not.toMatch(/[[\]]/)
      expect(value).toBeDefined()
      expect(resolveValue(value ?? '', scopes.light)).toBe(expected)
      expect(enclosingMedia(rule)).toBeUndefined()
    }
  })

  it('side menu width transition compiles (lamb-page-shell C7)', () => {
    const rule = ruleFor(css, 'transition-width')

    const value = declIn(rule, 'transition-property')

    expect(value).toBeDefined()
    expect(resolveValue(value ?? '', scopes.light)).toBe('width')
    expect(enclosingMedia(rule)).toBeUndefined()
  })

  it('stats grid (C34)', () => {
    const value = declIn(
      ruleFor(css, 'grid-cols-fill-55'),
      'grid-template-columns'
    )
    const resolved = resolveValue(value ?? '', scopes.light).replace(
      /\s+/g,
      ' '
    )
    const match = resolved.match(
      /^repeat\( ?auto-fit, minmax\(calc\((\d*\.?\d+)(rem|px) \* (\d+)\), 1fr\) ?\)$/
    )

    expect(match).not.toBeNull()
    const [, unit = '', kind, count = ''] = match ?? []
    const px = Number(unit) * (kind === 'rem' ? 16 : 1) * Number(count)
    // invariant: criterion 34 of `.tasks/lamb-page-shell.md`, Lamb's
    // `.lamb-grid-stats` minimum.
    expect(px).toBe(220)
  })

  // invariant: criterion 17 of `.tasks/lamb-overlays.md` as [App px, Painel
  // px], written apart from the Dialog density class lists.
  const DIALOG_DENSITY_PX: ReadonlyArray<
    [string, () => string, string, [number, number]]
  > = [
    [
      'header padding-top',
      () => DIALOG_HEADER_DENSITY,
      'padding-top',
      [20, 24]
    ],
    [
      'header padding-inline',
      () => DIALOG_HEADER_DENSITY,
      'padding-inline',
      [20, 24]
    ],
    [
      'body padding-inline',
      () => DIALOG_BODY_DENSITY,
      'padding-inline',
      [20, 24]
    ],
    [
      'body padding-bottom',
      () => DIALOG_BODY_DENSITY,
      'padding-bottom',
      [20, 24]
    ],
    [
      'footer padding-top',
      () => DIALOG_FOOTER_DENSITY,
      'padding-top',
      [12, 16]
    ],
    [
      'footer padding-inline',
      () => DIALOG_FOOTER_DENSITY,
      'padding-inline',
      [20, 24]
    ],
    [
      'footer padding-bottom',
      () => DIALOG_FOOTER_DENSITY,
      'padding-bottom',
      [20, 24]
    ]
  ]

  it.each(DIALOG_DENSITY_PX)(
    'dialog density resolves in CSS (C17): %s',
    (_name, classes, prop, expected) => {
      expectAutoDensity(densityOf(classes(), prop), expected)
    }
  )

  it('dialog density resolves in CSS (C17): fixed 8px between header and body', () => {
    expect(spacingPx(declIn(ruleFor(css, 'pb-2'), 'padding-bottom'))).toBe(8)
    expect(spacingPx(declIn(ruleFor(css, 'pt-2'), 'padding-top'))).toBe(8)
  })

  it.each([
    ['flex-direction', 'flex-col', 'flex-row', 'column', 'row'],
    ['align-items', 'items-stretch', 'items-center', 'stretch', 'center'],
    ['width', '*:w-full', '*:w-auto', '100%', 'auto']
  ])(
    'dialog density resolves in CSS (C17): footer %s',
    (prop, appClass, panelClass, appValue, panelValue) => {
      const tokens = DIALOG_FOOTER_DENSITY.split(' ')
      const app = ruleFor(css, appClass)
      const panel = ruleFor(css, `${PANEL_PREFIX}${panelClass}`)
      const desktop = ruleFor(css, `${DESKTOP_PREFIX}${panelClass}`)

      expect(tokens).toEqual(
        expect.arrayContaining([
          appClass,
          `${PANEL_PREFIX}${panelClass}`,
          `${DESKTOP_PREFIX}${panelClass}`
        ])
      )
      expect(declIn(app, prop)).toBe(appValue)
      expect(enclosingMedia(app)).toBeUndefined()
      expect(declIn(panel, prop)).toBe(panelValue)
      expect(enclosingMedia(panel)).toBe('(width >= 60rem)')
      expect(panel.selector).toContain(
        ':not(:where([data-viewport="mobile"]) *)'
      )
      expect(declIn(desktop, prop)).toBe(panelValue)
      expect(enclosingMedia(desktop)).toBeUndefined()
      expect(desktop.selector).toContain(':where([data-viewport="desktop"])')
      expect(sourceIndex(css, desktop)).toBeGreaterThan(sourceIndex(css, app))
    }
  )

  it.each([
    [SHEET_FADE, 'sheet-fade 200ms ease-out', 'opacity', '0'],
    [SHEET_SLIDE, 'sheet-in 250ms ease-out', 'translate', '0 100%']
  ])(
    'bottom sheet motion resolves in CSS (C35): %s',
    (utility, animation, prop, from) => {
      const name = animation.split(' ')[0]
      const rule = ruleFor(css, utility)
      let start: string | undefined
      css.walkAtRules('keyframes', keyframes => {
        if (keyframes.params !== name) return
        keyframes.walkDecls(prop, decl => {
          start = decl.value
        })
      })

      expect(utility.startsWith('motion-safe:')).toBe(true)
      expect(enclosingMedia(rule)).toBe(
        '(prefers-reduced-motion: no-preference)'
      )
      expect(resolveValue(declIn(rule, 'animation') ?? '', scopes.light)).toBe(
        animation
      )
      expect(start).toBe(from)
    }
  )

  // invariant: criterion 42 of `.tasks/lamb-fields-lists.md` as [App value,
  // Painel value], written apart from the FilterBar class lists.
  const FILTERBAR_DENSITY: ReadonlyArray<
    [string, () => string, string, string, string, string, string]
  > = [
    [
      'chips row keeps one line',
      () => CHIPS_ROW_DENSITY,
      'flex-wrap',
      'flex-nowrap',
      'flex-wrap',
      'nowrap',
      'wrap'
    ],
    [
      'chip list keeps one line',
      () => CHIP_LIST_DENSITY,
      'flex-wrap',
      'flex-nowrap',
      'flex-wrap',
      'nowrap',
      'wrap'
    ],
    [
      'chip list scrolls sideways',
      () => CHIP_LIST_DENSITY,
      'overflow-x',
      'overflow-x-auto',
      'overflow-x-visible',
      'auto',
      'visible'
    ],
    [
      'search takes the whole row',
      () => SEARCH_DENSITY,
      'flex-basis',
      'basis-full',
      'basis-60',
      '100%',
      '240px'
    ],
    [
      'search drops its max width',
      () => SEARCH_DENSITY,
      'max-width',
      'max-w-none',
      'max-w-90',
      'none',
      '360px'
    ],
    [
      'counter loses its push',
      () => COUNT_DENSITY,
      'margin-left',
      'ml-0',
      'ml-auto',
      '0px',
      'auto'
    ]
  ]

  const pxOrRaw = (value: string | undefined) =>
    value?.startsWith('calc(var(--spacing)') || value === '0'
      ? `${spacingPx(value)}px`
      : value

  it.each(FILTERBAR_DENSITY)(
    'FilterBar app density (C42): %s',
    (_name, classes, prop, appClass, panelClass, appValue, panelValue) => {
      const tokens = classes().split(' ')
      const app = ruleFor(css, appClass)
      const panel = ruleFor(css, `${PANEL_PREFIX}${panelClass}`)
      const desktop = ruleFor(css, `${DESKTOP_PREFIX}${panelClass}`)

      expect(tokens).toEqual(
        expect.arrayContaining([
          appClass,
          `${PANEL_PREFIX}${panelClass}`,
          `${DESKTOP_PREFIX}${panelClass}`
        ])
      )
      expect(pxOrRaw(declIn(app, prop))).toBe(appValue)
      expect(enclosingMedia(app)).toBeUndefined()
      expect(pxOrRaw(declIn(panel, prop))).toBe(panelValue)
      expect(enclosingMedia(panel)).toBe('(width >= 60rem)')
      expect(panel.selector).toContain(
        ':not(:where([data-viewport="mobile"]) *)'
      )
      expect(pxOrRaw(declIn(desktop, prop))).toBe(panelValue)
      expect(enclosingMedia(desktop)).toBeUndefined()
      expect(desktop.selector).toContain(':where([data-viewport="desktop"])')
      expect(sourceIndex(css, desktop)).toBeGreaterThan(sourceIndex(css, app))
    }
  )

  it('FilterBar app density (C42): chips snap with proximity and hide the scrollbar', () => {
    const tokens = CHIP_LIST_DENSITY.split(' ')
    const snap = ruleFor(css, 'snap-x')
    const strictness = ruleFor(css, 'snap-proximity')
    const hidden = ruleFor(css, 'no-scrollbar')
    let webkitHidden: string | undefined
    // why: Tailwind keeps the utility's `&::-webkit-scrollbar` nested.
    hidden.walkRules(rule => {
      if (rule.selector === '&::-webkit-scrollbar')
        webkitHidden = declIn(rule, 'display')
    })

    expect(tokens).toEqual(
      expect.arrayContaining(['snap-x', 'snap-proximity', 'no-scrollbar'])
    )
    expect(
      declIn(snap, 'scroll-snap-type')?.replace(
        'var(--tw-scroll-snap-strictness)',
        declIn(strictness, '--tw-scroll-snap-strictness') ?? ''
      )
    ).toBe('x proximity')
    expect(declIn(hidden, 'scrollbar-width')).toBe('none')
    expect(webkitHidden).toBe('none')
    ;[snap, strictness, hidden].forEach(rule =>
      expect(enclosingMedia(rule)).toBeUndefined()
    )
  })

  it('List section spacing (C47)', () => {
    const rule = ruleForArbitrary(css, LIST_SECTION_GAP)
    document.body.innerHTML = [
      '<section data-list-section id="first"></section>',
      '<section data-list-section id="second"></section>',
      '<div></div><section data-list-section id="after-other"></section>'
    ].join('')
    document
      .querySelectorAll('section')
      .forEach(section => section.classList.add(LIST_SECTION_GAP))
    const matched = Array.from(document.querySelectorAll(rule.selector)).map(
      node => node.id
    )
    document.body.innerHTML = ''

    expect(rule.selector.startsWith('[data-list-section] + .')).toBe(true)
    expect(spacingPx(declIn(rule, 'margin-top'))).toBe(8)
    expect(enclosingMedia(rule)).toBeUndefined()
    expect(matched).toEqual(['second'])
  })

  it('Select focus ring (C7)', () => {
    const focus = (utility: string) =>
      ruleForArbitrary(css, `${SELECT_FOCUS_VARIANT}${utility}`)
    const width = focus('outline-2')
    const offset = focus('outline-offset-2')
    const color = focus('outline-focus-ring')
    const [border, ring, ringColor] = SELECT_OPEN_RING.map(utility =>
      ruleFor(css, utility)
    )

    ;[width, offset, color].forEach(rule => {
      expect(rule.selector).toContain(':has(')
      expect(rule.selector).toContain('[role=combobox]:focus-visible')
      expect(enclosingMedia(rule)).toBeUndefined()
    })
    expect(declIn(width, 'outline-width')).toBe('2px')
    expect(declIn(offset, 'outline-offset')).toBe('2px')
    expect(
      resolveValue(declIn(color, 'outline-color') ?? '', scopes.light)
    ).toBe('#27272F')
    expect(
      resolveValue(declIn(border, 'border-color') ?? '', scopes.light)
    ).toBe('#27272F')
    expect(declIn(ring, '--tw-ring-shadow')).toContain(
      '0 0 0 calc(1px + var(--tw-ring-offset-width))'
    )
    expect(
      resolveValue(declIn(ringColor, '--tw-ring-color') ?? '', scopes.light)
    ).toBe('#27272F')
  })

  it('skeleton pulse (C49)', () => {
    const rule = ruleFor(css, SKELETON_PULSE)
    const frames: Record<string, string> = {}
    css.walkAtRules('keyframes', keyframes => {
      if (keyframes.params !== 'skeleton-pulse') return
      keyframes.walkRules(frame => {
        frame.walkDecls(decl => {
          frames[`${frame.selector} ${decl.prop}`] = decl.value
        })
      })
    })

    expect(SKELETON_PULSE.startsWith('motion-safe:')).toBe(true)
    expect(enclosingMedia(rule)).toBe('(prefers-reduced-motion: no-preference)')
    expect(resolveValue(declIn(rule, 'animation') ?? '', scopes.light)).toBe(
      'skeleton-pulse 1.4s ease-in-out infinite'
    )
    expect(frames).toEqual({ '50% opacity': '0.5' })
  })
})
