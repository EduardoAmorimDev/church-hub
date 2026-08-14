import { render, screen, within } from '@testing-library/react'
import { Button } from '@church/ui/atoms/Button'
import { Chip } from '@church/ui/atoms/Chip'
import type { BreadcrumbItem } from '@church/ui/molecules/Breadcrumb'
import { PageHeader } from '.'

// why: jsdom loads no Tailwind CSS, so these specs assert the utility classes
// requested and the real DOM semantics.
const PANEL = 'panel:not-in-data-[viewport=mobile]:'
const DESKTOP = 'in-data-[viewport=desktop]:'

// invariant: synthetic data only (constitution, Principle V).
const TRAIL: BreadcrumbItem[] = [
  { label: 'Início', href: '/' },
  { label: 'Pessoas', href: '/pessoas' },
  { label: 'Membros' }
]
const ACTIONS = (
  <>
    <Button size="small">Adicionar</Button>
    <Button size="small" variant="ghost">
      Exportar
    </Button>
  </>
)
const CHIPS = (
  <>
    <Chip selected>Todos</Chip>
    <Chip>Ativos</Chip>
  </>
)

const headerOf = () => screen.getByRole('banner')
const headingOf = () => screen.getByRole('heading', { level: 1 })
const rowOf = () => {
  const row = headerOf().firstElementChild
  if (!(row instanceof HTMLElement)) throw new Error('no row')
  return row
}

describe('PageHeader', () => {
  it('header shell (C21)', () => {
    render(<PageHeader chips={CHIPS} title="Membros" />)
    const header = headerOf()

    expect(header.tagName).toBe('HEADER')
    expect(header).toHaveClass(
      'flex',
      'flex-col',
      'gap-6',
      'pt-4',
      'pb-3',
      'px-5',
      `${PANEL}px-8`,
      `${DESKTOP}px-8`
    )
    expect(header).not.toHaveClass('px-8')
    expect(header.innerHTML).not.toMatch(/(^|[\s"])lg:/)
    expect(Array.from(header.children)).toEqual([
      rowOf(),
      screen.getByRole('group', { name: 'Filtros rápidos' })
    ])
  })

  it('main row layout (C22)', () => {
    render(
      <PageHeader
        actions={ACTIONS}
        description="Quem faz parte"
        title="Membros"
      />
    )
    const row = rowOf()
    const titles = headingOf().parentElement
    const actions = screen.getByRole('button', {
      name: 'Adicionar'
    }).parentElement

    expect(row).toHaveClass(
      'flex',
      'items-end',
      'justify-between',
      'gap-4',
      'flex-wrap'
    )
    expect(Array.from(row.children)).toEqual([titles, actions])
    expect(titles).toHaveClass('flex', 'flex-col', 'gap-1', 'min-w-0')
    expect(actions).toHaveClass('flex', 'items-center', 'gap-2')
    expect(actions).toContainElement(
      screen.getByRole('button', { name: 'Exportar' })
    )
  })

  it('main row layout (C22): no actions, no actions row', () => {
    render(<PageHeader title="Membros" />)

    expect(rowOf().children).toHaveLength(1)
  })

  it('primary header (C23)', () => {
    const { unmount } = render(
      <PageHeader
        actions={ACTIONS}
        breadcrumb={TRAIL}
        chips={CHIPS}
        description="Quem faz parte da igreja"
        title="Membros"
      />
    )
    const heading = headingOf()
    const titles = heading.parentElement
    const trail = screen.getByRole('navigation', {
      name: 'Trilha de navegação'
    })
    const description = screen.getByText('Quem faz parte da igreja')
    const chips = screen.getByRole('group', { name: 'Filtros rápidos' })

    expect(titles && Array.from(titles.children)).toEqual([
      trail,
      heading,
      description
    ])
    expect(within(trail).getAllByRole('listitem')).toHaveLength(3)
    expect(heading.tagName).toBe('H1')
    expect(heading).toHaveTextContent('Membros')
    expect(heading).toHaveClass('text-size-300', 'font-semibold')
    expect(description.tagName).toBe('P')
    expect(description).toHaveClass(
      'text-size-50',
      'leading-5',
      'font-normal',
      'text-primary'
    )
    expect(chips).toHaveClass('flex', 'gap-2', 'flex-wrap')
    expect(within(chips).getByRole('button', { name: 'Todos' })).toBeVisible()
    expect(rowOf().nextElementSibling).toBe(chips)
    unmount()

    render(<PageHeader title="Membros" />)

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
    expect(headingOf().parentElement?.children).toHaveLength(1)
  })

  it('home header (C24)', () => {
    const { rerender } = render(
      <PageHeader
        breadcrumb={TRAIL}
        chips={CHIPS}
        description="Resumo da semana"
        greeting="Olá, Pessoa Exemplo"
        title="Início"
        type="home"
      />
    )
    const heading = headingOf()

    expect(heading.tagName).toBe('H1')
    expect(heading).toHaveTextContent('Olá, Pessoa Exemplo')
    expect(heading).toHaveClass(
      'font-oswald',
      'font-bold',
      'uppercase',
      'text-size-300',
      'leading-7.5'
    )
    expect(heading.nextElementSibling).toBe(
      screen.getByText('Resumo da semana')
    )
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('group', { name: 'Filtros rápidos' })
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Todos' })).toBeNull()

    rerender(<PageHeader title="Início" type="home" />)

    expect(headingOf()).toHaveTextContent('Início')
    expect(headingOf()).toHaveClass('font-oswald', 'uppercase')
  })
})
