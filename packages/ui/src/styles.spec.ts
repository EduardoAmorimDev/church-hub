import fs from 'node:fs'
import path from 'node:path'
import postcss, { Root } from 'postcss'
import { compile } from 'tailwindcss'

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

let css: Root
let scopes: ReturnType<typeof collectScopes>

beforeAll(async () => {
  css = await buildCss([
    ...SEMANTIC.map(([utility]) => utility),
    ...ELEVATION.map(([name]) => `shadow-elevation-${name}`),
    'font-sans'
  ])
  scopes = collectScopes(css)
})

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
})
