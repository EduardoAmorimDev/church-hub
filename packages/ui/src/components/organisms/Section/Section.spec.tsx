import { render, screen } from '@testing-library/react'
import { Button } from '@church/ui/atoms/Button'
import { SearchField } from '@church/ui/atoms/SearchField'
import { Section, SectionProps } from '.'

// why: jsdom loads no Tailwind CSS and has no layout, so these specs assert
// the utility classes requested and the real DOM semantics.

// invariant: synthetic data only (constitution, Principle V).
const renderSection = (props: Partial<SectionProps> = {}) =>
  render(
    <Section title="Membros" {...props}>
      <p>Conteúdo da seção</p>
    </Section>
  )

const regionOf = (name = 'Membros') => screen.getByRole('region', { name })
const headOf = () => {
  const head = regionOf().firstElementChild
  if (!(head instanceof HTMLElement)) throw new Error('no header')
  return head
}
const toolsOf = () => headOf().children.item(1)

describe('Section', () => {
  it('section markup (C51)', () => {
    renderSection({ id: 'membros' })
    const region = regionOf()

    expect(region.tagName).toBe('SECTION')
    expect(region).toHaveAttribute('id', 'membros')
    expect(region).toHaveClass(
      'flex',
      'flex-col',
      'bg-surface',
      'rounded-2xl',
      'min-w-0'
    )
  })

  it('header (C52)', () => {
    const full = renderSection({
      actions: (
        <>
          <Button size="small" variant="ghost">
            Importar
          </Button>
          <Button size="small">Novo membro</Button>
        </>
      ),
      description: '1.234 pessoas cadastradas'
    })
    const head = headOf()
    const top = head.firstElementChild
    const heading = screen.getByRole('heading', { level: 2, name: 'Membros' })
    const description = screen.getByText('1.234 pessoas cadastradas')
    const actions = screen.getByRole('button', {
      name: 'Importar'
    }).parentElement

    expect(head).toHaveClass('border-b', 'border-default')
    expect(top).toHaveClass(
      'flex',
      'flex-wrap',
      'items-start',
      'justify-between',
      'gap-4',
      'p-4'
    )
    expect(heading).toHaveClass('text-size-200', 'font-semibold')
    expect(description.tagName).toBe('P')
    expect(description).toHaveClass(
      'text-size-50',
      'leading-5',
      'font-normal',
      'text-secondary',
      'mt-0.5'
    )
    expect(description.previousElementSibling).toBe(heading)
    expect(actions?.parentElement).toBe(top)
    expect(actions).toHaveClass('flex', 'flex-wrap', 'items-center', 'gap-2')
    expect(actions?.previousElementSibling).toContainElement(heading)
    full.unmount()

    renderSection({ headingLevel: 3 })
    expect(
      screen.getByRole('heading', { level: 3, name: 'Membros' })
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
    expect(headOf().firstElementChild?.children).toHaveLength(1)
  })

  it('tools row (C53)', () => {
    const full = renderSection({
      filters: (
        <>
          <Button size="small" variant="ghost">
            Situação
          </Button>
          <Button size="small" variant="ghost">
            GC
          </Button>
        </>
      ),
      search: <SearchField placeholder="Buscar membro" size="small" />
    })
    const tools = toolsOf()
    const searchWrapper = screen.getByRole('search').parentElement
    const filters = screen.getByRole('button', { name: 'GC' }).parentElement

    expect(tools).toHaveClass(
      'flex',
      'flex-wrap',
      'items-center',
      'justify-between',
      'gap-4',
      'pt-0',
      'px-4',
      'pb-4'
    )
    expect(searchWrapper?.parentElement).toBe(tools)
    expect(searchWrapper).toHaveClass(
      'grow',
      'shrink',
      'basis-60',
      'max-w-77.25'
    )
    expect(filters?.parentElement).toBe(tools)
    expect(filters).toHaveClass('flex', 'flex-wrap', 'items-center', 'gap-2')
    full.unmount()

    const onlyFilters = renderSection({ filters: <Button>GC</Button> })
    expect(toolsOf()).not.toBeNull()
    onlyFilters.unmount()

    const simple = renderSection({
      filters: <Button>GC</Button>,
      search: <SearchField size="small" />,
      simple: true
    })
    expect(headOf().children).toHaveLength(1)
    expect(screen.queryByRole('search')).not.toBeInTheDocument()
    simple.unmount()

    renderSection()
    expect(headOf().children).toHaveLength(1)
  })

  it('body (C54)', () => {
    renderSection()
    const body = screen.getByText('Conteúdo da seção').parentElement

    expect(body?.parentElement).toBe(regionOf())
    expect(body?.previousElementSibling).toBe(headOf())
    expect(body).toHaveClass('p-4', 'flex', 'flex-col', 'gap-2.5', 'min-w-0')
  })

  it('footer (C55)', () => {
    const button = renderSection({ footer: <Button>Ver todos</Button> })
    const buttonFooter = screen.getByRole('button', {
      name: 'Ver todos'
    }).parentElement

    expect(buttonFooter?.parentElement).toBe(regionOf())
    expect(buttonFooter).toHaveClass(
      'border-t',
      'border-default',
      'flex',
      'items-center',
      'gap-4',
      'p-4'
    )
    button.unmount()

    const paginator = renderSection({
      footer: <Button>Próxima</Button>,
      footerType: 'paginator'
    })
    const paginatorFooter = screen.getByRole('button', {
      name: 'Próxima'
    }).parentElement
    expect(paginatorFooter).toHaveClass(
      'border-t',
      'border-default',
      'gap-4',
      'px-4',
      'py-2'
    )
    expect(paginatorFooter).not.toHaveClass('p-4')
    paginator.unmount()

    renderSection()
    expect(regionOf().children).toHaveLength(2)
  })
})
