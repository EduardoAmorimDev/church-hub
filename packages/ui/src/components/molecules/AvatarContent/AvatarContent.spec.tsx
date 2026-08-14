import fs from 'node:fs'
import path from 'node:path'
import { render, screen, within } from '@testing-library/react'
import { AvatarContent, AvatarContentMeta } from './AvatarContent'

// why: jsdom loads no Tailwind CSS, so these specs assert the utility classes
// requested and the real DOM semantics, not computed styles.
const META: AvatarContentMeta[] = [
  { label: 'Rede', value: 'Jovens' },
  { label: 'GC', value: 'GC Exemplo' },
  { label: 'Membro desde', value: '2020' },
  { label: 'Função', value: 'Líder' }
]

const sectionOf = () => screen.getByRole('region', { name: 'Pessoa Exemplo' })

describe('AvatarContent', () => {
  it('identity header (C62)', () => {
    render(<AvatarContent name="Pessoa Exemplo" />)
    const section = sectionOf()
    const heading = within(section).getByRole('heading', {
      level: 3,
      name: 'Pessoa Exemplo'
    })
    const head = section.firstElementChild
    const avatar = head?.firstElementChild

    expect(section.tagName).toBe('SECTION')
    expect(section).toHaveAttribute('aria-label', 'Pessoa Exemplo')
    expect(section).toHaveClass(
      'p-6',
      'gap-4.5',
      'rounded-2xl',
      'bg-surface',
      'border',
      'border-default'
    )
    expect(head).toHaveClass('flex', 'items-center', 'gap-4')
    expect(avatar).toHaveClass('size-14')
    expect(avatar).toHaveAttribute('aria-hidden', 'true')
    expect(avatar).not.toHaveAttribute('role')
    expect(within(section).queryByRole('img')).not.toBeInTheDocument()
    expect(heading).toHaveClass('text-size-200', 'font-semibold')
  })

  it('description and badges (C63)', () => {
    const { rerender } = render(<AvatarContent name="Pessoa Exemplo" />)

    expect(sectionOf().querySelector('p')).toBeNull()

    rerender(
      <AvatarContent
        badges={
          <>
            <span>Membro</span>
            <span>Líder de GC</span>
          </>
        }
        description="Rede Jovens · GC Exemplo"
        name="Pessoa Exemplo"
      />
    )
    const description = screen.getByText('Rede Jovens · GC Exemplo')
    const badges = screen.getByText('Membro').parentElement

    expect(description).toHaveClass(
      'text-size-50',
      'leading-5',
      'font-normal',
      'text-secondary'
    )
    expect(description.previousElementSibling).toHaveTextContent(
      'Pessoa Exemplo'
    )
    expect(badges).toHaveClass('flex', 'flex-wrap', 'gap-2', 'mt-1')
    expect(badges?.children).toHaveLength(2)
  })

  it('meta list (C64)', () => {
    const { rerender } = render(<AvatarContent name="Pessoa Exemplo" />)

    expect(sectionOf().querySelector('dl')).toBeNull()

    rerender(<AvatarContent meta={META} name="Pessoa Exemplo" />)
    const list = sectionOf().querySelector('dl')
    const terms = within(sectionOf()).getAllByRole('term')
    const details = within(sectionOf()).getAllByRole('definition')
    const theme = fs.readFileSync(
      path.resolve(__dirname, '../../../styles.css'),
      'utf8'
    )

    expect(list).toHaveClass('grid', 'grid-cols-fill-30', 'gap-3')
    // invariant: 30 spacing units of 4px = the 120px minimum column.
    expect(theme.replace(/\s+/g, ' ')).toContain(
      '--grid-template-columns-fill-30: repeat( auto-fit, minmax(calc(var(--spacing) * 30), 1fr) );'
    )
    expect(terms.map(term => term.textContent)).toEqual([
      'Rede',
      'GC',
      'Membro desde',
      'Função'
    ])
    expect(details.map(detail => detail.textContent)).toEqual([
      'Jovens',
      'GC Exemplo',
      '2020',
      'Líder'
    ])
    terms.forEach(term =>
      expect(term).toHaveClass('text-size-25', 'font-medium', 'text-secondary')
    )
    details.forEach(detail =>
      expect(detail).toHaveClass(
        'text-size-50',
        'leading-5',
        'font-medium',
        'mt-0.5'
      )
    )
  })

  it.each([2, 3, 4] as const)('heading level (C65): %s', level => {
    render(<AvatarContent headingLevel={level} name="Pessoa Exemplo" />)

    expect(
      screen.getByRole('heading', { level, name: 'Pessoa Exemplo' })
    ).toBeInTheDocument()
  })
})
