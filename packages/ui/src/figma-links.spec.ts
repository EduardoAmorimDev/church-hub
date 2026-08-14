import fs from 'node:fs'
import path from 'node:path'
import badgeMeta from './components/atoms/Badge/Badge.stories'
import buttonMeta from './components/atoms/Button/Button.stories'
import cellMeta from './components/atoms/Cell/Cell.stories'
import checkboxMeta from './components/atoms/Checkbox/Checkbox.stories'
import iconButtonMeta from './components/atoms/IconButton/IconButton.stories'
import navItemMeta from './components/atoms/NavItem/NavItem.stories'
import searchFieldMeta from './components/atoms/SearchField/SearchField.stories'
import tagMeta from './components/atoms/Tag/Tag.stories'
import textAreaMeta from './components/atoms/TextArea/TextArea.stories'
import textFieldMeta from './components/atoms/TextField/TextField.stories'
import navigationMeta from './components/molecules/Navigation/Navigation.stories'
import paginatorMeta from './components/molecules/Paginator/Paginator.stories'
import toastMeta from './components/molecules/Toast/Toast.stories'
import tableMeta from './components/organisms/Table/Table.stories'

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
  ['Navigation', navigationMeta, ['12967:3606']],
  ['Table', tableMeta, ['13616:5097']],
  ['Cell', cellMeta, ['13615:5291']],
  ['Paginator', paginatorMeta, ['13607:2572']],
  ['Toast', toastMeta, ['13805:425']]
]

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
