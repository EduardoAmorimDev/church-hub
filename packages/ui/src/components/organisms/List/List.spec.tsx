import { render, screen, within } from '@testing-library/react'
import { ReactElement } from 'react'
import { EmptyState, EmptyStateProps } from '@church/ui/molecules/EmptyState'
import { ListItem } from '@church/ui/molecules/ListItem'
import { List, ListDensity, ListSection } from '.'

// why: jsdom loads no Tailwind CSS and has no layout, so these specs assert
// the utility classes requested and the real DOM semantics.

// invariant: Lamb's ListItem heights per density, written apart from the
// ListItem class table (`.lamb-li[data-density]`).
const ROW_HEIGHT: Record<ListDensity, string> = {
  compact: 'min-h-12',
  default: 'min-h-16',
  comfortable: 'min-h-18'
}

const rowOf = (title: string) => {
  const row = screen.getByText(title).closest('li')?.firstElementChild
  if (!row) throw new Error(`no row for ${title}`)
  return row
}

// invariant: synthetic data only (constitution, Principle V).
describe('List', () => {
  it('region (C45)', () => {
    const named = render(
      <List label="Aniversariantes">
        <ListItem title="Pessoa Exemplo" />
      </List>
    )
    const region = screen.getByRole('region', { name: 'Aniversariantes' })

    expect(region).toHaveClass('flex', 'flex-col', 'text-primary')
    named.unmount()

    const { container } = render(
      <List>
        <ListItem title="Pessoa Exemplo" />
      </List>
    )
    expect(screen.queryByRole('region')).not.toBeInTheDocument()
    expect(container.firstElementChild).not.toHaveAttribute('role')
    expect(container.firstElementChild).toHaveClass('flex-col', 'text-primary')
  })

  it.each(['compact', 'default', 'comfortable'] as const)(
    'plain list and density (C46): %s',
    density => {
      render(
        <List density={density}>
          <ListItem title="Pessoa Exemplo A" />
          <ListItem density="comfortable" title="Pessoa Exemplo B" />
        </List>
      )
      const list = screen.getByRole('list')

      expect(list.tagName).toBe('UL')
      expect(list).toHaveAttribute('role', 'list')
      expect(list).toHaveClass('m-0', 'p-0', 'list-none')
      expect(within(list).getAllByRole('listitem')).toHaveLength(2)
      expect(rowOf('Pessoa Exemplo A')).toHaveClass(ROW_HEIGHT[density])
      expect(rowOf('Pessoa Exemplo B')).toHaveClass(ROW_HEIGHT.comfortable)
    }
  )

  it('plain list and density (C46): default when omitted', () => {
    render(
      <List>
        <ListItem title="Pessoa Exemplo A" />
      </List>
    )

    expect(rowOf('Pessoa Exemplo A')).toHaveClass(ROW_HEIGHT.default)
  })

  it('sections (C47)', () => {
    render(
      <List density="compact" label="Aniversariantes">
        <ListSection title="Hoje">
          <ListItem title="Pessoa Exemplo A" />
          <ListItem density="comfortable" title="Pessoa Exemplo B" />
        </ListSection>
        <ListSection headingLevel={4} title="Esta semana">
          <ListItem title="Pessoa Exemplo C" />
        </ListSection>
      </List>
    )
    const today = screen.getByRole('region', { name: 'Hoje' })
    const week = screen.getByRole('region', { name: 'Esta semana' })
    const heading = screen.getByRole('heading', { level: 3, name: 'Hoje' })

    expect(today.tagName).toBe('SECTION')
    expect(week.tagName).toBe('SECTION')
    expect(today.nextElementSibling).toBe(week)
    expect(
      screen.getByRole('heading', { level: 4, name: 'Esta semana' })
    ).toBeInTheDocument()
    expect(heading).toHaveClass(
      'text-size-25',
      'font-medium',
      'text-secondary',
      'pt-3',
      'px-4',
      'pb-1'
    )

    const items = within(today).getByRole('list')
    expect(items.tagName).toBe('UL')
    expect(items).toHaveClass('m-0', 'p-0', 'list-none')
    expect(rowOf('Pessoa Exemplo A')).toHaveClass(ROW_HEIGHT.compact)
    expect(rowOf('Pessoa Exemplo B')).toHaveClass(ROW_HEIGHT.comfortable)
    expect(rowOf('Pessoa Exemplo C')).toHaveClass(ROW_HEIGHT.compact)

    // invariant: 8px only on a section that follows another one.
    const gap = '[[data-list-section]+&]:mt-2'
    expect(today).toHaveAttribute('data-list-section')
    expect(week).toHaveAttribute('data-list-section')
    expect(week).toHaveClass(gap)
  })

  it('loading skeleton (C48)', () => {
    const { rerender } = render(
      <List empty={{ title: 'Nada por aqui' }} loading>
        {[]}
      </List>
    )
    const list = screen.getByRole('list')
    const rows = list.querySelectorAll('li[aria-hidden="true"]')
    const status = screen.getByRole('status')

    expect(list.tagName).toBe('UL')
    expect(list).toHaveAttribute('aria-busy', 'true')
    expect(rows).toHaveLength(3)
    expect(status).toHaveTextContent('Carregando…')
    expect(status).toHaveClass('sr-only')
    expect(status.tagName).toBe('LI')
    expect(screen.queryByText('Nada por aqui')).not.toBeInTheDocument()

    const [circle, longBar, shortBar] = Array.from(
      rows[0]?.querySelectorAll('span.bg-selected') ?? []
    )
    expect(circle).toHaveClass('size-8', 'rounded-full', 'bg-selected')
    expect(longBar).toHaveClass('h-3', 'w-3/5', 'rounded-lg', 'bg-selected')
    expect(shortBar).toHaveClass('h-3', 'w-7/20', 'rounded-lg', 'bg-selected')

    rerender(
      <List loading skeletonCount={5}>
        <ListItem title="Pessoa Exemplo A" />
      </List>
    )
    expect(
      screen.getByRole('list').querySelectorAll('li[aria-hidden="true"]')
    ).toHaveLength(5)
    expect(screen.queryByText('Pessoa Exemplo A')).not.toBeInTheDocument()
  })

  it('skeleton motion (C49)', () => {
    render(<List loading />)
    const pieces = screen.getByRole('list').querySelectorAll('span.bg-selected')

    expect(pieces).toHaveLength(9)
    pieces.forEach(piece =>
      expect(piece).toHaveClass('motion-safe:animate-skeleton-pulse')
    )
    pieces.forEach(piece =>
      expect(piece.className).not.toMatch(/(^|\s)animate-/)
    )
  })

  it('empty (C50)', () => {
    const emptyProps: EmptyStateProps = {
      description: 'Volte na segunda.',
      iconName: 'cake',
      title: 'Nenhum aniversariante esta semana'
    }
    const markupOf = (node: ReactElement) => {
      const { container, unmount } = render(node)
      const html = container.innerHTML
      unmount()
      return html
    }
    const inlineSmall = markupOf(
      <EmptyState size="small" variant="inline" {...emptyProps} />
    )
    const medium = markupOf(<EmptyState variant="inline" {...emptyProps} />)
    const page = markupOf(
      <EmptyState size="small" variant="page" {...emptyProps} />
    )

    const fromProps = render(<List empty={emptyProps} />)
    const listRoot = fromProps.container.firstElementChild
    expect(listRoot?.innerHTML).toBe(inlineSmall)
    expect(listRoot?.innerHTML).not.toBe(medium)
    expect(listRoot?.innerHTML).not.toBe(page)
    const title = screen.getByRole('heading', {
      name: 'Nenhum aniversariante esta semana'
    })
    const emptyRoot = title.parentElement?.parentElement

    expect(screen.getByText('Volte na segunda.')).toBeInTheDocument()
    expect(emptyRoot).toHaveClass('gap-3', 'px-4', 'py-6')
    expect(emptyRoot?.querySelector('.size-14')).not.toBeNull()
    expect(emptyRoot).not.toHaveClass('min-h-90')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    fromProps.unmount()

    const element = render(<List empty={<p>Sem pessoas</p>}>{null}</List>)
    expect(screen.getByText('Sem pessoas').tagName).toBe('P')
    element.unmount()

    render(
      <List empty={{ title: 'Nada por aqui' }}>
        <ListItem title="Pessoa Exemplo A" />
      </List>
    )
    expect(screen.queryByText('Nada por aqui')).not.toBeInTheDocument()
  })
})
