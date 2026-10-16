import fs from 'node:fs'
import path from 'node:path'
import badgeMeta from './components/atoms/Badge/Badge.stories'
import buttonMeta from './components/atoms/Button/Button.stories'
import cellMeta from './components/atoms/Cell/Cell.stories'
import checkboxMeta from './components/atoms/Checkbox/Checkbox.stories'
import chipMeta from './components/atoms/Chip/Chip.stories'
import dividerMeta from './components/atoms/Divider/Divider.stories'
import iconButtonMeta from './components/atoms/IconButton/IconButton.stories'
import logoMeta from './components/atoms/Logo/Logo.stories'
import navItemMeta from './components/atoms/NavItem/NavItem.stories'
import searchFieldMeta from './components/atoms/SearchField/SearchField.stories'
import tagMeta from './components/atoms/Tag/Tag.stories'
import textAreaMeta from './components/atoms/TextArea/TextArea.stories'
import textFieldMeta from './components/atoms/TextField/TextField.stories'
import alertMeta from './components/molecules/Alert/Alert.stories'
import avatarContentMeta from './components/molecules/AvatarContent/AvatarContent.stories'
import breadcrumbMeta from './components/molecules/Breadcrumb/Breadcrumb.stories'
import menuDropdownMeta from './components/molecules/MenuDropdown/MenuDropdown.stories'
import navigationMeta from './components/molecules/Navigation/Navigation.stories'
import paginatorMeta from './components/molecules/Paginator/Paginator.stories'
import statCardMeta from './components/molecules/StatCard/StatCard.stories'
import toastMeta from './components/molecules/Toast/Toast.stories'
import drawerMeta from './components/organisms/Drawer/Drawer.stories'
import menuDrawerMeta from './components/organisms/MenuDrawer/MenuDrawer.stories'
import pageHeaderMeta from './components/organisms/PageHeader/PageHeader.stories'
import sectionMeta from './components/organisms/Section/Section.stories'
import sideMenuMeta from './components/organisms/SideMenu/SideMenu.stories'
import tableMeta from './components/organisms/Table/Table.stories'
import pageMeta from './components/templates/Page/Page.stories'
import type { DateRange, ISODate } from '@church/ui/molecules/DatePicker'

const FIGMA_FILE =
  'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System'

type StoryMeta = { parameters?: { design?: unknown } }

// invariant: the Figma nodes of the task's Sources table, one row per component.
const NODES: ReadonlyArray<[string, StoryMeta, ReadonlyArray<string>]> = [
  ['Button', buttonMeta, ['12968:2661']],
  ['IconButton', iconButtonMeta, ['13465:1130']],
  ['Badge', badgeMeta, ['13803:5494']],
  ['Tag', tagMeta, ['13596:406']],
  ['Checkbox', checkboxMeta, ['13628:1215', '13628:1586']],
  ['TextField', textFieldMeta, ['13607:2966']],
  ['TextArea', textAreaMeta, ['13607:3107']],
  ['SearchField', searchFieldMeta, ['13607:3072']],
  ['NavItem', navItemMeta, ['12966:3837', '13506:10602']],
  ['Navigation', navigationMeta, ['13020:3345']],
  ['Table', tableMeta, ['13616:5097']],
  ['Cell', cellMeta, ['13615:5291']],
  ['Paginator', paginatorMeta, ['13607:2572']],
  ['Toast', toastMeta, ['13805:425']],
  ['Divider', dividerMeta, ['13628:935']],
  ['Logo', logoMeta, ['12967:3338']],
  ['Chip', chipMeta, ['13596:6864']],
  ['Breadcrumb', breadcrumbMeta, ['13601:3774']],
  ['Alert', alertMeta, ['13792:9332']],
  ['StatCard', statCardMeta, ['13619:2165']],
  ['AvatarContent', avatarContentMeta, ['13803:10719']],
  ['MenuDropdown', menuDropdownMeta, ['13033:3147']],
  ['Drawer', drawerMeta, ['13803:11075']],
  ['Section', sectionMeta, ['13630:9165']],
  ['PageHeader', pageHeaderMeta, ['13505:4430']],
  ['SideMenu', sideMenuMeta, ['12967:3606']],
  ['MenuDrawer', menuDrawerMeta, ['13506:21084']],
  ['Page', pageMeta, ['13685:3211']]
]

// invariant: the atoms of `.tasks/lamb-atoms.md`; each one is public API.
const NEW_ATOMS = [
  'Divider',
  'Spinner',
  'CountBadge',
  'Logo',
  'Chip',
  'Radio',
  'Toggle',
  'Stack'
] as const

describe('lamb atoms (lote 1)', () => {
  it.each(NEW_ATOMS)(
    'new atoms resolve through the package exports (C58): %s',
    async name => {
      const exported: Record<string, unknown> = await import(
        `@church/ui/atoms/${name}`
      )

      expect(exported[name]).toBeDefined()
    }
  )

  it.each(NEW_ATOMS)('new atoms are documented (C60): %s', async name => {
    const dir = path.join(__dirname, 'components/atoms', name)
    const files = [`${name}.tsx`, `${name}.spec.tsx`, `${name}.stories.tsx`]
    const story: { default: { title?: string } } = await import(
      `./components/atoms/${name}/${name}.stories`
    )
    const doc = fs.readFileSync(
      path.resolve(__dirname, '../../docs/figma-components.md'),
      'utf8'
    )

    files.forEach(file =>
      expect(fs.existsSync(path.join(dir, file))).toBe(true)
    )
    expect(story.default.title).toBe(`atoms/${name}`)
    expect(doc).toMatch(
      new RegExp(
        `^\\| ${name}( \\(|\\s+\\|).*\`@church/ui/atoms/${name}\``,
        'm'
      )
    )
  })
})

// invariant: the 10 molecules and the atom of `.tasks/lamb-molecules.md`
// (criterion 96); each one is public API with a spec and a story.
const BATCH_2 = [
  'atoms/AvatarGroup',
  'molecules/Breadcrumb',
  'molecules/FilterChip',
  'molecules/Alert',
  'molecules/RadioGroup',
  'molecules/EmptyState',
  'molecules/StatCard',
  'molecules/AvatarContent',
  'molecules/ListItem',
  'molecules/MenuDropdown',
  'molecules/DatePicker'
] as const

// why: types vanish at runtime; `npm run typecheck` compiles these lines, so
// they fail if the DatePicker barrel stops exporting `ISODate`/`DateRange`.
const SAMPLE_DAY: ISODate = '2026-10-08'
const SAMPLE_RANGE = {
  start: '2026-10-06',
  end: null
} satisfies DateRange

const nameOf = (entry: (typeof BATCH_2)[number]) => entry.split('/')[1] ?? ''

describe('lamb molecules (lote 2)', () => {
  it.each(BATCH_2)(
    'lote 2 resolves through the package exports (C98): %s',
    async entry => {
      const exported: Record<string, unknown> = await import(
        `@church/ui/${entry}`
      )

      expect(exported[nameOf(entry)]).toBeDefined()
    }
  )

  it('lote 2 resolves through the package exports (C98): ISODate and DateRange', async () => {
    const exported: Record<string, unknown> =
      await import('@church/ui/molecules/DatePicker')

    expect(exported.DatePicker).toBeDefined()
    expect(SAMPLE_DAY).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(SAMPLE_RANGE).toEqual({ start: '2026-10-06', end: null })
  })

  it.each(BATCH_2)('lote 2 is documented (C100): %s', async entry => {
    const name = nameOf(entry)
    const dir = path.join(__dirname, 'components', entry)
    const files = [`${name}.tsx`, `${name}.spec.tsx`, `${name}.stories.tsx`]
    const story: { default: { title?: string } } = await import(
      `./components/${entry}/${name}.stories`
    )
    const doc = fs.readFileSync(
      path.resolve(__dirname, '../../docs/figma-components.md'),
      'utf8'
    )

    files.forEach(file =>
      expect(fs.existsSync(path.join(dir, file))).toBe(true)
    )
    expect(story.default.title).toBe(entry)
    expect(doc).toMatch(
      new RegExp(`^\\| ${name}( \\(|\\s+\\|).*\`@church/ui/${entry}\``, 'm')
    )
  })

  it('lote 2 is documented (C100): the Menu dropdown row is built', () => {
    const doc = fs.readFileSync(
      path.resolve(__dirname, '../../docs/figma-components.md'),
      'utf8'
    )

    expect(doc).not.toMatch(/^\| Menu dropdown\s.*Not built yet/m)
    expect(doc).toMatch(
      /^\| MenuDropdown \(`13033:3147`\).*`@church\/ui\/molecules\/MenuDropdown`/m
    )
  })
})

// invariant: the three organisms of `.tasks/lamb-overlays.md` (criterion
// 36); each one is public API with a spec and a story.
const BATCH_3 = ['Dialog', 'Drawer', 'BottomSheet'] as const

describe('lamb overlays (lote 3)', () => {
  it.each(BATCH_3)(
    'lote 3 resolves and is documented (C36): %s',
    async name => {
      const exported: Record<string, unknown> = await import(
        `@church/ui/organisms/${name}`
      )
      const dir = path.join(__dirname, 'components/organisms', name)
      const files = [`${name}.tsx`, `${name}.spec.tsx`, `${name}.stories.tsx`]
      const story: { default: { title?: string } } = await import(
        `./components/organisms/${name}/${name}.stories`
      )
      const doc = fs.readFileSync(
        path.resolve(__dirname, '../../docs/figma-components.md'),
        'utf8'
      )

      expect(typeof exported[name]).toBe('function')
      files.forEach(file =>
        expect(fs.existsSync(path.join(dir, file))).toBe(true)
      )
      expect(story.default.title).toBe(`organisms/${name}`)
      expect(doc).toMatch(
        new RegExp(
          `^\\| ${name}( \\(|\\s+\\|).*\`@church/ui/organisms/${name}\``,
          'm'
        )
      )
    }
  )

  it('lote 3 resolves and is documented (C36): the modal layer from @church/ui/utils', async () => {
    const utils: Record<string, unknown> = await import('@church/ui/utils')

    expect(typeof utils.useModalLayer).toBe('function')
    expect(
      fs.existsSync(
        path.join(__dirname, 'components/utils/useModalLayer.spec.tsx')
      )
    ).toBe(true)
  })

  it.each(['Dialog', 'BottomSheet'])(
    'lote 3 resolves and is documented (C36): %s has no Figma node',
    async name => {
      const story: { default: StoryMeta } = await import(
        `./components/organisms/${name}/${name}.stories`
      )

      expect(story.default.parameters?.design).toBeUndefined()
    }
  )
})

// invariant: the five organisms of `.tasks/lamb-fields-lists.md` (criteria
// 56–58); each one is public API with a spec and a story.
const BATCH_4 = ['Select', 'DateField', 'FilterBar', 'List', 'Section'] as const

const readFigmaDoc = () =>
  fs.readFileSync(
    path.resolve(__dirname, '../../docs/figma-components.md'),
    'utf8'
  )

describe('lamb fields and lists (lote 4)', () => {
  it.each(BATCH_4)('lamb batch 4 exports (C56): %s', async name => {
    const exported: Record<string, unknown> = await import(
      `@church/ui/organisms/${name}`
    )
    const dir = path.join(__dirname, 'components/organisms', name)
    const files = [`${name}.tsx`, `${name}.spec.tsx`, `${name}.stories.tsx`]
    const story: { default: { title?: string } } = await import(
      `./components/organisms/${name}/${name}.stories`
    )

    // why: DateField is a `forwardRef` object, the others are functions.
    expect(exported[name]).toBeDefined()
    files.forEach(file =>
      expect(fs.existsSync(path.join(dir, file))).toBe(true)
    )
    expect(story.default.title).toBe(`organisms/${name}`)
  })

  it('lamb batch 4 exports (C56): ListSection from the List path', async () => {
    const exported: Record<string, unknown> =
      await import('@church/ui/organisms/List')

    expect(exported.ListSection).toBeDefined()
  })

  it.each(BATCH_4.filter(name => name !== 'Section'))(
    'lamb batch 4 has a Figma node only on the Section (C57): %s has none',
    async name => {
      const story: { default: StoryMeta } = await import(
        `./components/organisms/${name}/${name}.stories`
      )

      expect(story.default.parameters?.design).toBeUndefined()
    }
  )

  it.each(BATCH_4)('figma-components rows (C58): %s', name => {
    const rows = readFigmaDoc()
      .split('\n')
      .filter(line => new RegExp(`^\\| ${name}( \\(|\\s+\\|)`).test(line))

    expect(rows).toHaveLength(1)
    expect(rows[0]).toContain(`\`@church/ui/organisms/${name}\``)
  })

  it('figma-components rows (C58): ListItem no longer defers List', () => {
    const row = readFigmaDoc()
      .split('\n')
      .find(line => /^\| ListItem\s+\|/.test(line))

    expect(row).toBeDefined()
    expect(row).not.toContain('come with the organisms')
    expect(row).toContain('`@church/ui/organisms/List`')
  })
})

// invariant: the batch of `.tasks/lamb-page-shell.md` (criteria 35–38):
// three organisms and the first template, each public API with spec and story.
const BATCH_5 = [
  'organisms/SideMenu',
  'organisms/MenuDrawer',
  'organisms/PageHeader',
  'templates/Page'
] as const

const batch5Name = (entry: (typeof BATCH_5)[number]) =>
  entry.split('/')[1] ?? ''

describe('lamb page shell (lote 5)', () => {
  it.each(BATCH_5)('lamb batch 5 exports (C35): %s', async entry => {
    const name = batch5Name(entry)
    const exported: Record<string, unknown> = await import(
      `@church/ui/${entry}`
    )
    const dir = path.join(__dirname, 'components', entry)
    const files = [`${name}.tsx`, `${name}.spec.tsx`, `${name}.stories.tsx`]
    const story: { default: { title?: string } } = await import(
      `./components/${entry}/${name}.stories`
    )

    expect(typeof exported[name]).toBe('function')
    files.forEach(file =>
      expect(fs.existsSync(path.join(dir, file))).toBe(true)
    )
    expect(story.default.title).toBe(entry)
  })

  it('lamb batch 5 exports (C35): PageBody from the Page path, shown in its story', async () => {
    const exported: Record<string, unknown> =
      await import('@church/ui/templates/Page')
    const story = fs.readFileSync(
      path.join(__dirname, 'components/templates/Page/Page.stories.tsx'),
      'utf8'
    )

    expect(typeof exported.PageBody).toBe('function')
    expect(story).toMatch(/<PageBody[\s>]/)
  })

  it.each([
    ['PageHeader', pageHeaderMeta, '13505:4430'],
    ['SideMenu', sideMenuMeta, '12967:3606'],
    ['MenuDrawer', menuDrawerMeta, '13506:21084'],
    ['Page', pageMeta, '13685:3211'],
    ['Navigation', navigationMeta, '13020:3345']
  ] satisfies ReadonlyArray<[string, StoryMeta, string]>)(
    'batch 5 figma nodes (C36): %s',
    (_name, meta, id) => {
      const urls = designUrls(meta)

      expect(urls).toEqual([
        `${FIGMA_FILE}?node-id=${id.replace(':', '-')}&m=dev`
      ])
    }
  )

  it.each([
    ['PageHeader', '13505:4430', '`@church/ui/organisms/PageHeader`'],
    ['SideMenu', '12967:3606', '`@church/ui/organisms/SideMenu`'],
    ['MenuDrawer', '13506:21084', '`@church/ui/organisms/MenuDrawer`'],
    ['Page', '13685:3211', '`@church/ui/templates/Page`']
  ])('figma-components rows batch 5 (C37): %s', (name, id, importPath) => {
    const rows = readFigmaDoc()
      .split('\n')
      .filter(line => line.startsWith(`| ${name} (`))

    expect(rows).toHaveLength(1)
    expect(rows[0]).toContain(`\`${id}\``)
    expect(rows[0]).toContain(importPath)
    if (name === 'Page') expect(rows[0]).toContain('PageBody')
  })

  it("figma-components rows batch 5 (C37): Navigation is Lamb's Menus", () => {
    const doc = readFigmaDoc()
    const rows = doc
      .split('\n')
      .filter(line => line.startsWith('| Navigation ('))

    expect(rows).toHaveLength(1)
    expect(rows[0]).toContain('`13020:3345`')
    expect(rows[0]).not.toContain('`12967:3606`')
    expect(doc).not.toContain("Lamb's Side menu")
  })

  // invariant: the names in the artifact previews, never in our fixtures.
  const PREVIEW_NAMES = ['Lucas', 'Vieira', 'Ana Souza', 'Bruno Lima']
  const BATCH_5_FILES = [
    'organisms/SideMenu/SideMenu',
    'organisms/MenuDrawer/MenuDrawer',
    'organisms/PageHeader/PageHeader',
    'templates/Page/Page',
    'atoms/NavItem/NavItem'
  ].flatMap(base => [`${base}.stories.tsx`, `${base}.spec.tsx`])

  it.each(BATCH_5_FILES)('synthetic fixtures batch 5 (C38): %s', file => {
    const source = fs.readFileSync(
      path.join(__dirname, 'components', file),
      'utf8'
    )

    PREVIEW_NAMES.forEach(name => expect(source).not.toContain(name))
  })
})

const urlOf = (design: unknown) =>
  typeof design === 'object' && design !== null && 'url' in design
    ? design.url
    : undefined

const designUrls = (meta: StoryMeta) => {
  const design = meta.parameters?.design
  const entries: unknown[] = Array.isArray(design) ? design : [design]
  return entries.map(urlOf)
}

const nodeUrl = (id: string) => `${FIGMA_FILE}?node-id=${id.replace(':', '-')}`

describe('figma links (C44)', () => {
  it.each(NODES)(
    'story design links: %s points to its Figma node(s)',
    (_name, meta, ids) => {
      const urls = designUrls(meta)

      expect(urls).toHaveLength(ids.length)
      ids.forEach((id, index) => {
        const url = urls[index]
        expect(typeof url).toBe('string')
        expect(String(url).startsWith(nodeUrl(id))).toBe(true)
        expect(String(url)).toMatch(
          new RegExp(`node-id=${id.replace(':', '-')}(&|$)`)
        )
      })
    }
  )

  describe('figma-components doc', () => {
    const doc = fs.readFileSync(
      path.resolve(__dirname, '../../docs/figma-components.md'),
      'utf8'
    )
    const lines = doc.split('\n')
    const lineWith = (...parts: string[]) =>
      lines.find(line => parts.every(part => line.includes(part)))

    it.each(NODES)(
      'figma-components doc lists %s with its node(s)',
      (name, _meta, ids) => {
        const row = lines.find(line => line.startsWith(`| ${name} (`))

        expect(row).toBeDefined()
        ids.forEach(id => expect(row).toContain(`\`${id}\``))
      }
    )

    it.each([
      ['--text-primary', 'text-primary'],
      ['--text-secondary', 'text-secondary'],
      ['--text-disabled', 'text-disabled'],
      ['--text-inverse', 'text-inverse'],
      ['--text-link', 'text-link'],
      ['--text-danger', 'text-danger'],
      ['--text-positive', 'text-positive'],
      ['--text-attention', 'text-attention'],
      ['--text-accent', 'text-accent'],
      ['--text-on-accent', 'text-on-accent'],
      ['--text-on-positive', 'text-on-positive'],
      ['--text-on-danger', 'text-on-danger'],
      ['--text-on-attention', 'text-on-attention'],
      ['--bg-page', 'bg-page'],
      ['--bg-surface', 'bg-surface'],
      ['--bg-hover', 'bg-hover'],
      ['--bg-selected', 'bg-selected'],
      ['--bg-disabled', 'bg-disabled'],
      ['--bg-action-primary', 'bg-action-primary'],
      ['--bg-accent-solid', 'bg-accent-solid'],
      ['--bg-positive-solid', 'bg-positive-solid'],
      ['--bg-danger-solid', 'bg-danger-solid'],
      ['--bg-attention-solid', 'bg-attention-solid'],
      ['--bg-accent-subtle', 'bg-accent-subtle'],
      ['--bg-positive-subtle', 'bg-positive-subtle'],
      ['--bg-danger-subtle', 'bg-danger-subtle'],
      ['--bg-attention-subtle', 'bg-attention-subtle'],
      ['--bg-scrim', 'bg-scrim'],
      ['--border-default', 'border-default'],
      ['--border-control', 'border-control'],
      ['--focus-ring', 'outline-focus-ring'],
      ['--brand-red', 'text-brand-red'],
      ['--brand-blue', 'text-brand-blue'],
      ['--brand-teal', 'text-brand-teal']
    ])(
      'figma-components doc maps the semantic token %s to %s',
      (token, utility) => {
        expect(lineWith(`\`${token}\``, `\`${utility}\``)).toBeDefined()
      }
    )

    it.each([
      ['2xs', '4px', 'rounded-sm'],
      ['xs', '6px', 'rounded-md'],
      ['sm', '8px', 'rounded-lg'],
      ['md', '10px', 'rounded-10'],
      ['lg', '12px', 'rounded-xl'],
      ['xl', '16px', 'rounded-2xl'],
      ['2xl', '24px', 'rounded-3xl']
    ])(
      'figma-components doc maps the Lamb radius %s (%s) to %s',
      (name, px, utility) => {
        expect(
          lineWith(`| \`${name}\` `, `| ${px} `, `\`${utility}\``)
        ).toBeDefined()
      }
    )
  })
})
