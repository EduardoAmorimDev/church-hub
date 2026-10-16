import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fullArt } from '@church/ui/atoms/Logo/data'
import type { NavItemProps } from '@church/ui/atoms/NavItem'
import type { NavUser } from '@church/ui/organisms/SideMenu'
import { MenuDrawer, MenuDrawerProps } from '.'

// why: `motion` (inside NavItem) reads the reduced-motion preference through
// matchMedia, which jsdom does not provide.
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false
    })
  })
})

afterEach(() => {
  document.body.style.overflow = ''
})

// invariant: synthetic data only (constitution, Principle V).
const ITEMS: NavItemProps[] = [
  { iconName: 'home', label: 'Início', activated: true },
  {
    iconName: 'group',
    label: 'Pessoas',
    subItems: [{ label: 'Membros' }, { label: 'Visitantes' }]
  }
]
const FOOTER: NavItemProps[] = [
  { iconName: 'settings', label: 'Configurações' }
]
const USER: NavUser = { name: 'Pessoa Exemplo', role: 'Função Exemplo' }

const renderDrawer = (props: Partial<MenuDrawerProps> = {}) =>
  render(<MenuDrawer items={ITEMS} onClose={jest.fn()} open {...props} />)

const dialogOf = (name = 'Menu principal') =>
  screen.getByRole('dialog', { name })
const closeOf = () => screen.getByRole('button', { name: 'Fechar menu' })
const scrimOf = (container: HTMLElement) => {
  const scrim = container.firstElementChild
  if (!(scrim instanceof HTMLElement)) throw new Error('no scrim')
  return scrim
}
const childAt = (parent: HTMLElement, index: number) => {
  const child = parent.children.item(index)
  if (!(child instanceof HTMLElement)) throw new Error(`no child ${index}`)
  return child
}

describe('MenuDrawer', () => {
  it('renders only when open (C15)', () => {
    const closed = renderDrawer({ open: false })

    expect(closed.container).toBeEmptyDOMElement()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    closed.unmount()

    const { container } = renderDrawer()
    const scrim = scrimOf(container)
    const dialog = dialogOf()

    expect(scrim).toHaveClass('fixed', 'inset-0', 'z-40', 'bg-scrim')
    expect(scrim).toHaveAttribute('aria-hidden', 'true')
    expect(scrim.nextElementSibling).toBe(dialog)
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-label', 'Menu principal')
    expect(dialog).toHaveAttribute('tabindex', '-1')
  })

  it('renders only when open (C15): label names the dialog', () => {
    renderDrawer({ label: 'Navegação da igreja' })

    expect(dialogOf('Navegação da igreja')).toHaveAttribute(
      'aria-label',
      'Navegação da igreja'
    )
  })

  it('panel side and shadow (C16)', () => {
    const right = renderDrawer()
    const panel = dialogOf()

    expect(panel).toHaveClass(
      'fixed',
      'top-0',
      'bottom-0',
      'z-41',
      'w-menu-drawer',
      'max-w-full',
      'bg-surface',
      'flex',
      'flex-col',
      'right-0',
      'shadow-elevation-low-left'
    )
    expect(panel).not.toHaveClass('left-0')
    expect(panel).not.toHaveClass('shadow-elevation-low-right')
    right.unmount()

    renderDrawer({ side: 'left' })
    const left = dialogOf()

    expect(left).toHaveClass(
      'fixed',
      'z-41',
      'w-menu-drawer',
      'max-w-full',
      'left-0',
      'shadow-elevation-low-right'
    )
    expect(left).not.toHaveClass('right-0')
    expect(left).not.toHaveClass('shadow-elevation-low-left')
  })

  it('drawer bar (C17)', () => {
    renderDrawer()
    const bar = childAt(dialogOf(), 0)
    const logo = within(bar).getByRole('img')
    const close = closeOf()

    expect(bar).toHaveClass(
      'flex',
      'h-16',
      'items-center',
      'justify-between',
      'px-5',
      'border-b',
      'border-default'
    )
    expect(bar.className).not.toMatch(/(^|\s)(py|pt|pb|p)-/)
    expect(Array.from(bar.children)).toEqual([logo, close])
    expect(logo).toHaveClass('h-9')
    expect(logo.querySelector('svg')).toHaveAttribute(
      'viewBox',
      fullArt.viewBox
    )
    // invariant: IconButton ghost + neutral + medium (Lamb `low`/`md`).
    expect(close).toHaveClass('bg-neutral-alpha/10', 'text-primary', 'size-12')
    expect(close).toHaveAttribute('type', 'button')
    expect(close).toHaveTextContent('close')
  })

  it('mobile items and footer (C18)', () => {
    const onProfileClick = jest.fn()
    renderDrawer({
      footerItems: FOOTER,
      label: 'Navegação da igreja',
      onProfileClick,
      user: USER
    })
    const dialog = dialogOf('Navegação da igreja')
    const nav = within(dialog).getByRole('navigation', {
      name: 'Navegação da igreja'
    })
    const footer = childAt(dialog, 2)
    const settings = within(footer).getByRole('button', {
      name: 'Configurações'
    })
    const profile = within(footer).getByRole('button', {
      name: /Pessoa Exemplo/
    })

    expect(dialog).toHaveAttribute('data-viewport', 'mobile')
    expect(nav.parentElement).toHaveClass(
      'px-5',
      'py-4',
      'flex-1',
      'overflow-y-auto'
    )
    for (const item of [
      within(nav).getByRole('button', { name: 'Início' }),
      settings
    ]) {
      expect(item.closest('[data-viewport]')).toBe(dialog)
      expect(item).toHaveClass('min-h-12')
      expect(item).not.toHaveAttribute('title')
    }
    expect(footer).toHaveClass(
      'border-t',
      'border-default',
      'pt-3',
      'px-5',
      'pb-5'
    )
    expect(within(footer).getByRole('list')).toContainElement(settings)
    expect(nav).not.toContainElement(settings)
    expect(footer.lastElementChild).toBe(profile)
    expect(profile).not.toHaveAttribute('aria-label')
    expect(within(profile).getByText('Pessoa Exemplo')).toBeInTheDocument()
    expect(within(profile).getByText('Função Exemplo')).toBeInTheDocument()
    profile.click()
    expect(onProfileClick).toHaveBeenCalledTimes(1)
  })

  it('mobile items and footer (C18): never collapsed', () => {
    renderDrawer({
      footerItems: [
        { iconName: 'settings', label: 'Configurações', collapsed: true }
      ],
      items: [{ iconName: 'home', label: 'Início', collapsed: true }]
    })

    expect(screen.getByRole('button', { name: 'Início' })).not.toHaveAttribute(
      'title'
    )
    expect(
      screen.getByRole('button', { name: 'Configurações' })
    ).not.toHaveAttribute('title')
    expect(screen.getByText('Início')).toBeVisible()
    expect(screen.getByText('Configurações')).toBeVisible()
  })

  it('mobile items and footer (C18): no user, no profile button', () => {
    renderDrawer()
    const footer = childAt(dialogOf(), 2)

    expect(footer).toBeEmptyDOMElement()
  })

  it('focus trap on open (C19)', async () => {
    const user = userEvent.setup()
    document.body.style.overflow = 'scroll'
    render(
      <>
        <button type="button">Fora</button>
        <MenuDrawer
          footerItems={FOOTER}
          items={ITEMS}
          onClose={jest.fn()}
          open
          user={USER}
        />
      </>
    )
    const profile = screen.getByRole('button', { name: /Pessoa Exemplo/ })

    await waitFor(() => expect(closeOf()).toHaveFocus())
    expect(document.body.style.overflow).toBe('hidden')

    await user.tab({ shift: true })
    expect(profile).toHaveFocus()

    await user.tab()
    expect(closeOf()).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('button', { name: 'Início' })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Fora' })).not.toHaveFocus()
  })

  it('closes and restores focus (C20)', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    const exits: ReadonlyArray<(container: HTMLElement) => Promise<void>> = [
      () => user.keyboard('{Escape}'),
      container => user.click(scrimOf(container)),
      () => user.click(closeOf())
    ]

    for (const exit of exits) {
      onClose.mockClear()
      const { container, unmount } = render(
        <MenuDrawer items={ITEMS} onClose={onClose} open />
      )
      await waitFor(() => expect(closeOf()).toHaveFocus())

      await exit(container)

      expect(onClose).toHaveBeenCalledTimes(1)
      unmount()
    }

    document.body.style.overflow = 'auto'
    const Harness = ({ open }: { open: boolean }) => (
      <>
        <button type="button">Abrir menu</button>
        <MenuDrawer items={ITEMS} onClose={onClose} open={open} />
      </>
    )
    const { rerender } = render(<Harness open={false} />)
    const trigger = screen.getByRole('button', { name: 'Abrir menu' })
    trigger.focus()

    rerender(<Harness open />)
    await waitFor(() => expect(closeOf()).toHaveFocus())
    expect(document.body.style.overflow).toBe('hidden')

    rerender(<Harness open={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    expect(document.body.style.overflow).toBe('auto')
  })

  it('profile menu: the footer profile opens profileMenuItems above it', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    renderDrawer({
      onClose,
      profileMenuItems: [{ iconName: 'logout', label: 'Sair' }],
      user: USER
    })
    const profile = within(dialogOf()).getByRole('button', {
      name: /Pessoa Exemplo/
    })

    expect(profile).toHaveAttribute('aria-haspopup', 'menu')
    await user.click(profile)
    const menu = screen.getByRole('menu', { name: 'Menu do perfil' })

    expect(menu).toHaveClass('bottom-full', 'mb-1')
    expect(within(menu).getByRole('menuitem', { name: 'Sair' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
  })
})
