import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { resolveIconName } from '@church/ui/atoms/Icon'
import { SearchField } from '@church/ui/atoms/SearchField'
import { APP_MEDIA_QUERY } from '@church/ui/utils'
import { ActiveFilter, FilterBar, FilterBarProps } from '.'

// why: jsdom loads no Tailwind CSS and has no layout, so these specs assert
// the utility classes requested and the real DOM semantics.
let narrow = false

const mediaQueryList = (query: string): MediaQueryList => ({
  get matches() {
    return narrow && query === APP_MEDIA_QUERY
  },
  media: query,
  onchange: null,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  dispatchEvent: jest.fn(() => false)
})

const matchMedia = jest.fn(mediaQueryList)

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: matchMedia,
    writable: true
  })
})

beforeEach(() => {
  narrow = false
  matchMedia.mockClear()
})

afterEach(() => {
  document.body.style.overflow = ''
})

// invariant: synthetic data only (constitution, Principle V).
const FILTERS: ActiveFilter[] = [
  { id: 'rede', label: 'Rede', value: 'Rede Exemplo', iconName: 'hub' },
  { id: 'dia', label: 'Dia', value: 'Terça' },
  { id: 'bairro', label: 'Bairro', value: 'Bairro Exemplo' }
]

const PANEL = <p>Conteúdo dos filtros</p>

const PANEL_PREFIX = 'panel:not-in-data-[viewport=mobile]:'
const DESKTOP_PREFIX = 'in-data-[viewport=desktop]:'
const painel = (utility: string) => [
  `${PANEL_PREFIX}${utility}`,
  `${DESKTOP_PREFIX}${utility}`
]

const renderBar = (props: Partial<FilterBarProps> = {}) =>
  render(<FilterBar {...props} />)

const filtersButton = () =>
  screen.getByRole('button', { name: /^Filtros(, \d+ ativos)?$/ })
const chipList = () => screen.getByRole('list', { name: 'Filtros ativos' })
const scrim = () => {
  const node = document.querySelector<HTMLElement>('.bg-scrim')
  if (!node) throw new Error('no scrim')
  return node
}

describe('FilterBar', () => {
  it('layout (C36)', () => {
    const { container } = renderBar({
      panel: PANEL,
      resultCount: 23,
      search: <SearchField size="small" />
    })
    const root = container.firstElementChild
    const top = root?.firstElementChild
    const searchWrapper = screen.getByRole('search').parentElement

    expect(root).toHaveClass('flex', 'flex-col', 'gap-3')
    expect(top).toHaveClass(
      'flex',
      'flex-wrap',
      'items-center',
      'gap-x-3',
      'gap-y-2'
    )
    expect(searchWrapper?.parentElement).toBe(top)
    expect(searchWrapper).toHaveClass(
      'grow',
      'shrink',
      ...painel('basis-60'),
      ...painel('max-w-90')
    )
  })

  it('filters button (C37)', () => {
    const withPanel = renderBar({ panel: PANEL })
    const button = filtersButton()

    expect(button).toHaveClass('bg-neutral-alpha/10', 'text-primary', 'h-8')
    expect(button).toHaveAttribute('aria-haspopup', 'dialog')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveTextContent('Filtros')
    expect(button.firstElementChild).toHaveTextContent(resolveIconName('tune'))
    withPanel.unmount()

    const custom = renderBar({ filtersLabel: 'Refinar', panel: PANEL })
    expect(screen.getByRole('button', { name: 'Refinar' })).toHaveTextContent(
      'Refinar'
    )
    custom.unmount()

    renderBar({ filters: FILTERS })
    expect(
      screen.queryByRole('button', { name: /^Filtros/ })
    ).not.toBeInTheDocument()
  })

  it('active count (C38)', () => {
    const active = renderBar({ filters: FILTERS, panel: PANEL })
    const button = screen.getByRole('button', { name: 'Filtros, 3 ativos' })
    const pill = button.querySelector(
      '[aria-hidden="true"]:not(.material-symbols-outlined)'
    )

    expect(pill).toHaveTextContent('3')
    expect(pill).toHaveClass(
      'h-5',
      'min-w-5',
      'px-1',
      'ml-1',
      'rounded-full',
      'bg-action-primary',
      'text-inverse',
      'text-size-25',
      'font-semibold'
    )
    active.unmount()

    renderBar({ panel: PANEL })
    const plain = screen.getByRole('button', { name: 'Filtros' })
    expect(plain.querySelector('.bg-action-primary')).toBeNull()
  })

  it('result count (C39)', () => {
    const plain = renderBar({ resultCount: 23 })
    const status = screen.getByRole('status')

    expect(status.tagName).toBe('P')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveTextContent('23 resultados')
    expect(status).toHaveClass(
      'text-size-50',
      'font-medium',
      'text-secondary',
      'whitespace-nowrap',
      ...painel('ml-auto')
    )
    plain.unmount()

    const full = renderBar({
      filters: FILTERS,
      panel: PANEL,
      resultCount: 23,
      search: <SearchField size="small" />
    })
    const top = full.container.firstElementChild?.firstElementChild
    const pushed = screen.getByRole('status')
    expect(top).toContainElement(filtersButton())
    expect(pushed.parentElement).toBe(top)
    expect(top?.lastElementChild).toBe(pushed)
    expect(pushed).toHaveClass(
      'panel:not-in-data-[viewport=mobile]:ml-auto',
      'in-data-[viewport=desktop]:ml-auto'
    )
    expect(chipList().contains(pushed)).toBe(false)
    full.unmount()

    const labelled = renderBar({
      resultCount: 23,
      resultLabel: count => `${count} GCs`
    })
    expect(screen.getByRole('status')).toHaveTextContent('23 GCs')
    labelled.unmount()

    renderBar({ panel: PANEL })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('active chips (C40)', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    const withPanel = renderBar({ filters: FILTERS, onChange, panel: PANEL })
    const list = chipList()

    expect(list.tagName).toBe('UL')
    expect(list).toHaveClass('gap-2')
    expect(within(list).getAllByRole('listitem')).toHaveLength(3)
    expect(
      within(list).getByRole('button', {
        name: 'Editar filtro Rede: Rede Exemplo'
      })
    ).toHaveTextContent(resolveIconName('hub'))

    await user.click(
      within(list).getByRole('button', { name: 'Remover filtro Dia: Terça' })
    )
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith([FILTERS[0], FILTERS[2]])

    await user.click(
      within(list).getByRole('button', {
        name: 'Editar filtro Bairro: Bairro Exemplo'
      })
    )
    expect(screen.getByRole('dialog', { name: 'Filtros' })).toBeInTheDocument()
    withPanel.unmount()

    const withoutPanel = renderBar({ filters: FILTERS, onChange })
    expect(
      screen.queryByRole('button', { name: /^Editar filtro/ })
    ).not.toBeInTheDocument()
    withoutPanel.unmount()

    renderBar({ panel: PANEL })
    expect(
      screen.queryByRole('list', { name: 'Filtros ativos' })
    ).not.toBeInTheDocument()
  })

  it('clear all (C41)', async () => {
    const user = userEvent.setup()
    const onClear = jest.fn()
    const two = renderBar({ filters: FILTERS.slice(0, 2), onClear })
    const clear = screen.getByRole('button', { name: 'Limpar tudo' })

    expect(clear).toHaveClass('bg-transparent', 'text-primary', 'h-8')
    expect(chipList().nextElementSibling).toBe(clear)
    await user.click(clear)
    expect(onClear).toHaveBeenCalledTimes(1)
    two.unmount()

    renderBar({ filters: FILTERS.slice(0, 1), onClear })
    expect(
      screen.queryByRole('button', { name: 'Limpar tudo' })
    ).not.toBeInTheDocument()
  })

  it('app density (C42)', () => {
    narrow = true
    render(
      <div data-viewport="mobile">
        <FilterBar
          filters={FILTERS}
          resultCount={3}
          search={<SearchField size="small" />}
        />
      </div>
    )
    const list = chipList()

    expect(list).toHaveClass(
      'flex-nowrap',
      'overflow-x-auto',
      'snap-x',
      'snap-proximity',
      'no-scrollbar',
      ...painel('flex-wrap'),
      ...painel('overflow-x-visible')
    )
    within(list)
      .getAllByRole('listitem')
      .forEach(item => expect(item).toHaveClass('snap-start'))
    expect(list.parentElement).toHaveClass(
      'flex-nowrap',
      ...painel('flex-wrap')
    )
    expect(screen.getByRole('search').parentElement).toHaveClass(
      'basis-full',
      'max-w-none',
      ...painel('basis-60'),
      ...painel('max-w-90')
    )
    expect(screen.getByRole('status')).toHaveClass('ml-0', ...painel('ml-auto'))
    // invariant: the density is CSS only; no render reads the window.
    expect(matchMedia).not.toHaveBeenCalled()
  })

  it('filters panel (C43)', async () => {
    const user = userEvent.setup()
    const onApply = jest.fn()
    const onClear = jest.fn()
    const painelBar = renderBar({
      onApply,
      onClear,
      panel: PANEL,
      panelTitle: 'Filtrar GCs'
    })

    await user.click(filtersButton())
    const drawer = screen.getByRole('dialog', { name: 'Filtrar GCs' })
    expect(drawer).toHaveClass('w-drawer')
    expect(drawer).toHaveAttribute('aria-modal', 'true')
    expect(within(drawer).getByText('Conteúdo dos filtros')).toBeInTheDocument()
    expect(filtersButton()).toHaveAttribute('aria-expanded', 'true')

    const clear = within(drawer).getByRole('button', { name: 'Limpar' })
    const apply = within(drawer).getByRole('button', { name: 'Ver resultados' })
    expect(clear).toHaveClass('bg-neutral-alpha/10', 'text-primary', 'h-12')
    expect(apply).toHaveClass('bg-neutral-999', 'text-neutral-00', 'h-12')

    await user.click(clear)
    expect(onClear).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(onApply).not.toHaveBeenCalled()

    await user.click(apply)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onApply).toHaveBeenCalledTimes(1)
    painelBar.unmount()

    narrow = true
    const app = renderBar({ onApply, panel: PANEL })
    await user.click(filtersButton())
    const sheet = screen.getByRole('dialog', { name: 'Filtros' })
    expect(sheet).toHaveClass('h-1/2')
    expect(within(sheet).getByText('Conteúdo dos filtros')).toBeInTheDocument()
    expect(
      within(sheet).getByRole('button', { name: 'Limpar' })
    ).toBeInTheDocument()
    await user.click(
      within(sheet).getByRole('button', { name: 'Ver resultados' })
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onApply).toHaveBeenCalledTimes(2)
    app.unmount()

    narrow = false
    render(
      <div data-viewport="mobile">
        <FilterBar panel={PANEL} />
      </div>
    )
    await user.click(filtersButton())
    expect(screen.getByRole('dialog', { name: 'Filtros' })).toHaveClass('h-1/2')
  })

  it('panel auto presentation (C1)', async () => {
    const user = userEvent.setup()

    const wide = renderBar({ panel: PANEL })
    await user.click(filtersButton())
    expect(screen.getByRole('dialog', { name: 'Filtros' })).toHaveClass(
      'w-drawer'
    )
    wide.unmount()

    narrow = true
    const narrowWindow = renderBar({ panel: PANEL })
    await user.click(filtersButton())
    expect(screen.getByRole('dialog', { name: 'Filtros' })).toHaveClass('h-1/2')
    narrowWindow.unmount()

    const desktop = render(
      <div data-viewport="desktop">
        <FilterBar panel={PANEL} />
      </div>
    )
    await user.click(filtersButton())
    const drawer = screen.getByRole('dialog', { name: 'Filtros' })
    expect(drawer).toHaveClass('w-drawer')
    expect(drawer).not.toHaveClass('h-1/2')
    desktop.unmount()

    narrow = false
    render(
      <div data-viewport="mobile">
        <FilterBar panel={PANEL} />
      </div>
    )
    await user.click(filtersButton())
    const sheet = screen.getByRole('dialog', { name: 'Filtros' })
    expect(sheet).toHaveClass('h-1/2')
    expect(sheet).not.toHaveClass('w-drawer')
  })

  it('panel presentation is fixed while open (C4)', async () => {
    const user = userEvent.setup()
    const wide = renderBar({ panel: PANEL })

    await user.click(filtersButton())
    expect(screen.getByRole('dialog')).toHaveClass('w-drawer')

    narrow = true
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    // why: a re-render while open fails any build that reads the width
    // during render instead of only when it opens.
    wide.rerender(<FilterBar panel={PANEL} resultCount={7} />)
    expect(screen.getByRole('status')).toHaveTextContent('7 resultados')
    expect(screen.getByRole('dialog')).toHaveClass('w-drawer')
    expect(screen.getByRole('dialog')).not.toHaveClass('h-1/2')

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(filtersButton())
    expect(screen.getByRole('dialog')).toHaveClass('h-1/2')
    wide.unmount()

    narrow = true
    const app = renderBar({ panel: PANEL })
    await user.click(filtersButton())
    expect(screen.getByRole('dialog')).toHaveClass('h-1/2')

    narrow = false
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    app.rerender(<FilterBar panel={PANEL} resultCount={7} />)
    expect(screen.getByRole('status')).toHaveTextContent('7 resultados')
    expect(screen.getByRole('dialog')).toHaveClass('h-1/2')
    expect(screen.getByRole('dialog')).not.toHaveClass('w-drawer')

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(filtersButton())
    expect(screen.getByRole('dialog')).toHaveClass('w-drawer')
  })

  it('dismiss the panel (C44)', async () => {
    const user = userEvent.setup()
    const onApply = jest.fn()
    renderBar({ filters: FILTERS, onApply, panel: PANEL })

    await user.click(filtersButton())
    await waitFor(() =>
      expect(screen.getByRole('dialog')).toContainElement(
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null
      )
    )
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(filtersButton()).toHaveFocus()
    expect(filtersButton()).toHaveAttribute('aria-expanded', 'false')

    await user.click(filtersButton())
    await user.click(scrim())
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(filtersButton()).toHaveFocus()

    await user.click(
      screen.getByRole('button', { name: 'Editar filtro Dia: Terça' })
    )
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Fechar' })
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(filtersButton()).toHaveFocus()

    expect(onApply).not.toHaveBeenCalled()
  })
})
