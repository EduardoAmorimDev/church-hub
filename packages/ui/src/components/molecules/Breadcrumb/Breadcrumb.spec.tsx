import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MouseEvent } from 'react'
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb'

// why: jsdom loads no Tailwind CSS, so these specs assert the utility classes
// requested and the real DOM semantics, not computed styles.
const ITEMS: BreadcrumbItem[] = [
  { label: 'Início', href: '/' },
  { label: 'Pessoas', href: '/pessoas' },
  { label: 'Pessoa Exemplo' }
]

const separatorsOf = (nav: HTMLElement) =>
  Array.from(nav.querySelectorAll('[aria-hidden="true"]'))

describe('Breadcrumb', () => {
  it('trail markup (C7)', () => {
    render(<Breadcrumb items={ITEMS} />)
    const nav = screen.getByRole('navigation', { name: 'Trilha de navegação' })
    const list = within(nav).getByRole('list')
    const entries = within(list).getAllByRole('listitem')

    expect(nav.tagName).toBe('NAV')
    expect(list.tagName).toBe('OL')
    expect(entries).toHaveLength(3)
    expect(within(nav).getByRole('link', { name: 'Início' })).toHaveAttribute(
      'href',
      '/'
    )
    expect(within(nav).getByRole('link', { name: 'Pessoas' })).toHaveAttribute(
      'href',
      '/pessoas'
    )
    expect(within(nav).getAllByRole('link')).toHaveLength(2)

    const current = within(entries[2]).getByText('Pessoa Exemplo')
    expect(current.tagName).toBe('SPAN')
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(current.closest('a')).toBeNull()
  })

  it('separators (C8)', () => {
    render(<Breadcrumb items={ITEMS} />)
    const nav = screen.getByRole('navigation')
    const entries = within(nav).getAllByRole('listitem')
    const separators = separatorsOf(nav)

    expect(separators).toHaveLength(2)
    separators.forEach(separator => expect(separator).toHaveTextContent('/'))
    expect(separatorsOf(entries[0])).toHaveLength(1)
    expect(separatorsOf(entries[1])).toHaveLength(1)
    expect(separatorsOf(entries[2])).toHaveLength(0)
    expect(entries[2].lastElementChild).toHaveTextContent('Pessoa Exemplo')
  })

  it('styles (C9)', () => {
    render(<Breadcrumb items={ITEMS} />)
    const nav = screen.getByRole('navigation')
    const list = within(nav).getByRole('list')
    const entries = within(nav).getAllByRole('listitem')
    const link = within(nav).getByRole('link', { name: 'Início' })

    expect(list).toHaveClass('text-size-50', 'font-medium', 'gap-2')
    entries.forEach(entry =>
      expect(entry).toHaveClass('gap-2', 'text-secondary')
    )
    expect(link).toHaveClass(
      'text-secondary',
      'hover:text-primary',
      'hover:underline'
    )
    expect(screen.getByText('Pessoa Exemplo')).toHaveClass('text-primary')
    separatorsOf(nav).forEach(separator =>
      expect(separator).toHaveClass('text-secondary')
    )
  })

  it('items without href and onClick (C10)', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn((event: MouseEvent<HTMLAnchorElement>) =>
      event.preventDefault()
    )
    render(
      <Breadcrumb
        items={[
          { label: 'Início', href: '/', onClick },
          { label: 'Relatórios' },
          { label: 'Relatório Fictício' }
        ]}
      />
    )
    const nav = screen.getByRole('navigation')
    const middle = within(nav).getByText('Relatórios')

    expect(middle.tagName).toBe('SPAN')
    expect(middle.closest('a')).toBeNull()
    expect(middle).not.toHaveAttribute('aria-current')
    expect(within(nav).getAllByRole('link')).toHaveLength(1)

    await user.click(within(nav).getByRole('link', { name: 'Início' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('custom label (C11)', () => {
    render(<Breadcrumb items={ITEMS} label="Caminho" />)

    expect(
      screen.getByRole('navigation', { name: 'Caminho' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('navigation', { name: 'Trilha de navegação' })
    ).not.toBeInTheDocument()
  })

  it('single item (C12)', () => {
    render(<Breadcrumb items={[{ label: 'Início', href: '/' }]} />)
    const nav = screen.getByRole('navigation')

    expect(within(nav).getAllByRole('listitem')).toHaveLength(1)
    expect(within(nav).queryByRole('link')).not.toBeInTheDocument()
    expect(within(nav).getByText('Início')).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(separatorsOf(nav)).toHaveLength(0)
  })
})
