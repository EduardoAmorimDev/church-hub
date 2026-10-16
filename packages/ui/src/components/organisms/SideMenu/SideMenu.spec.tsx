import { fireEvent, render, screen, within } from '@testing-library/react'
import { Avatar } from '@church/ui/atoms/Avatar'
import { resolveIconName } from '@church/ui/atoms/Icon'
import { fullArt, symbolArt } from '@church/ui/atoms/Logo/data'
import type { NavItemProps } from '@church/ui/atoms/NavItem'
import { SideMenu } from './SideMenu'
import type { NavUser } from './SideMenu.types'

// why: the decorative Avatar renders `alt` nowhere once a photo shows, so a
// spy proves the profile passes `alt={user.name}` (criterion 13).
jest.mock('@church/ui/atoms/Avatar', () => {
  const actual = jest.requireActual<typeof import('@church/ui/atoms/Avatar')>(
    '@church/ui/atoms/Avatar'
  )
  return { ...actual, Avatar: jest.fn(actual.Avatar) }
})

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
const USER: NavUser = {
  name: 'Pessoa Exemplo',
  role: 'Função Exemplo',
  src: '/avatar-exemplo.png'
}

const getAside = () => screen.getByRole('complementary')
const getHead = () =>
  screen.getByRole('button', { name: /menu$/ }).parentElement
const getFooter = () => {
  const footer = getAside().lastElementChild
  if (!(footer instanceof HTMLElement)) throw new Error('no footer')
  return footer
}

describe('SideMenu', () => {
  it('aside shell (C7)', () => {
    const { rerender } = render(<SideMenu items={ITEMS} />)
    const aside = getAside()

    expect(aside.tagName).toBe('ASIDE')
    expect(aside).toHaveClass(
      'flex',
      'flex-col',
      'h-full',
      'bg-surface',
      'border-r',
      'border-default',
      'w-sidebar',
      'transition-width',
      'duration-300',
      'ease-out',
      'shrink-0'
    )
    expect(aside).not.toHaveClass('w-sidebar-collapsed')

    rerender(<SideMenu collapsed items={ITEMS} />)

    expect(aside).toHaveClass('w-sidebar-collapsed', 'transition-width')
    expect(aside).not.toHaveClass('w-sidebar')
  })

  it('head with logo (C8)', () => {
    const { rerender } = render(<SideMenu items={ITEMS} />)
    const head = getHead()
    const fullLogo = within(head ?? document.body).getByRole('img')

    expect(head).toHaveClass(
      'h-16',
      'border-b',
      'border-default',
      'flex',
      'items-center',
      'justify-between',
      'px-4'
    )
    expect(fullLogo).toHaveClass('h-9')
    expect(fullLogo.querySelector('svg')).toHaveAttribute(
      'viewBox',
      fullArt.viewBox
    )

    rerender(<SideMenu collapsed items={ITEMS} />)
    const symbolLogo = within(head ?? document.body).getByRole('img')

    expect(head).toHaveClass('px-3')
    expect(head).not.toHaveClass('px-4')
    expect(symbolLogo).toHaveClass('h-8')
    expect(symbolLogo.querySelector('svg')).toHaveAttribute(
      'viewBox',
      symbolArt.viewBox
    )

    rerender(
      <SideMenu items={ITEMS} logo={<span data-testid="marca">Marca</span>} />
    )

    expect(within(head ?? document.body).getByTestId('marca')).toBeVisible()
    expect(
      within(head ?? document.body).queryByRole('img')
    ).not.toBeInTheDocument()
  })

  it('collapse button (C9)', () => {
    const { rerender } = render(<SideMenu items={ITEMS} />)
    const button = screen.getByRole('button', { name: 'Recolher menu' })

    expect(button.tagName).toBe('BUTTON')
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(button).toHaveClass(
      'size-7',
      'rounded-full',
      'border',
      'border-neutral-17',
      'bg-surface',
      'hover:bg-hover',
      'text-neutral-83',
      'absolute',
      'top-4.5',
      '-right-3.5',
      'z-2'
    )
    expect(within(button).getByText('chevron_left')).toHaveClass(
      'text-icon-20!'
    )

    rerender(<SideMenu collapsed items={ITEMS} />)
    const expand = screen.getByRole('button', { name: 'Expandir menu' })

    expect(expand).toBe(button)
    expect(expand).toHaveAttribute('aria-expanded', 'false')
    expect(within(expand).getByText('chevron_right')).toHaveClass(
      'text-icon-20!'
    )
  })

  it('controlled and uncontrolled collapse (C10)', () => {
    const onCollapsedChange = jest.fn()
    const { unmount } = render(
      <SideMenu items={ITEMS} onCollapsedChange={onCollapsedChange} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Recolher menu' }))

    expect(onCollapsedChange).toHaveBeenCalledTimes(1)
    expect(onCollapsedChange).toHaveBeenLastCalledWith(true)
    expect(getAside()).toHaveClass('w-sidebar-collapsed')

    fireEvent.click(screen.getByRole('button', { name: 'Expandir menu' }))

    expect(onCollapsedChange).toHaveBeenCalledTimes(2)
    expect(onCollapsedChange).toHaveBeenLastCalledWith(false)
    expect(getAside()).toHaveClass('w-sidebar')
    unmount()

    const fromDefault = render(<SideMenu defaultCollapsed items={ITEMS} />)

    expect(getAside()).toHaveClass('w-sidebar-collapsed')
    fireEvent.click(screen.getByRole('button', { name: 'Expandir menu' }))
    expect(getAside()).toHaveClass('w-sidebar')
    fromDefault.unmount()

    const onControlled = jest.fn()
    const { rerender } = render(
      <SideMenu
        collapsed={false}
        items={ITEMS}
        onCollapsedChange={onControlled}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Recolher menu' }))

    expect(onControlled).toHaveBeenCalledTimes(1)
    expect(onControlled).toHaveBeenCalledWith(true)
    expect(getAside()).toHaveClass('w-sidebar')
    expect(
      screen.getByRole('button', { name: 'Recolher menu' })
    ).toHaveAttribute('aria-expanded', 'true')

    rerender(
      <SideMenu collapsed items={ITEMS} onCollapsedChange={onControlled} />
    )

    expect(getAside()).toHaveClass('w-sidebar-collapsed')
    expect(onControlled).toHaveBeenCalledTimes(1)
  })

  it('navigation in the middle (C11)', () => {
    const { rerender } = render(<SideMenu items={ITEMS} />)
    const nav = screen.getByRole('navigation', { name: 'Menu principal' })
    const middle = nav.parentElement

    expect(within(nav).getByRole('button', { name: 'Início' })).toBeVisible()
    expect(within(nav).getByRole('button', { name: 'Pessoas' })).toBeVisible()
    expect(middle).toHaveClass(
      'flex-1',
      'min-h-0',
      'overflow-y-auto',
      'px-1.5',
      'py-4'
    )

    rerender(<SideMenu collapsed items={ITEMS} label="Navegação da igreja" />)
    const collapsedNav = screen.getByRole('navigation', {
      name: 'Navegação da igreja'
    })

    expect(collapsedNav.parentElement).toHaveClass('px-4', 'py-4')
    expect(collapsedNav.parentElement).not.toHaveClass('px-1.5')
    expect(
      within(collapsedNav).getByRole('button', { name: 'Início' })
    ).toHaveAttribute('title', 'Início')
  })

  it('footer items (C12)', () => {
    const { rerender } = render(<SideMenu items={ITEMS} />)
    const emptyFooter = getFooter()

    expect(emptyFooter).toHaveClass(
      'flex',
      'flex-col',
      'gap-2',
      'border-t',
      'border-default',
      'pt-3',
      'px-1.5',
      'pb-4'
    )
    expect(emptyFooter).toBeEmptyDOMElement()

    rerender(<SideMenu footerItems={FOOTER} items={ITEMS} />)
    const footer = getFooter()
    const list = within(footer).getByRole('list')
    const settings = within(list).getByRole('button', {
      name: 'Configurações'
    })

    expect(list.tagName).toBe('UL')
    expect(settings).not.toHaveAttribute('title')
    expect(
      screen.getByRole('navigation', { name: 'Menu principal' })
    ).not.toContainElement(settings)

    rerender(<SideMenu collapsed footerItems={FOOTER} items={ITEMS} />)

    expect(getFooter()).toHaveClass('px-4', 'py-3', 'border-t', 'gap-2')
    for (const utility of ['px-1.5', 'pt-3', 'pb-4'])
      expect(getFooter()).not.toHaveClass(utility)
    expect(
      screen.getByRole('button', { name: 'Configurações' })
    ).toHaveAttribute('title', 'Configurações')
  })

  it('profile button (C13)', () => {
    jest.mocked(Avatar).mockClear()
    const onProfileClick = jest.fn()
    const { rerender } = render(
      <SideMenu
        footerItems={FOOTER}
        items={ITEMS}
        onProfileClick={onProfileClick}
        user={USER}
      />
    )
    const profile = screen.getByRole('button', {
      name: /Pessoa Exemplo/
    })
    const avatar = profile.firstElementChild
    const name = within(profile).getByText('Pessoa Exemplo')
    const role = within(profile).getByText('Função Exemplo')

    expect(profile).toHaveAttribute('type', 'button')
    expect(getFooter().lastElementChild).toBe(profile)
    expect(profile).toHaveClass(
      'w-full',
      'gap-2',
      'px-2.5',
      'py-2',
      'rounded-lg',
      'hover:bg-hover'
    )
    expect(profile).not.toHaveAttribute('aria-label')
    expect(avatar).toHaveAttribute('aria-hidden', 'true')
    expect(avatar).toHaveClass('size-8')
    expect(jest.mocked(Avatar).mock.lastCall?.[0]).toMatchObject({
      alt: USER.name,
      decorative: true,
      size: 'small',
      src: USER.src
    })
    expect(avatar?.querySelector('img')?.getAttribute('src')).toContain(
      encodeURIComponent('/avatar-exemplo.png')
    )
    expect(name).toHaveClass('text-size-50', 'font-medium', 'text-primary')
    expect(role).toHaveClass('text-size-25', 'font-normal', 'text-secondary')
    expect(name.parentElement).toContainElement(role)
    expect(
      within(profile).getByText(resolveIconName('expand_more'))
    ).toBeInTheDocument()

    fireEvent.click(profile)
    expect(onProfileClick).toHaveBeenCalledTimes(1)

    rerender(<SideMenu items={ITEMS} user={{ name: 'Pessoa Exemplo' }} />)
    const initials = screen.getByRole('button', { name: 'Pessoa Exemplo' })

    expect(within(initials).getByText('PE')).toBeInTheDocument()
    expect(within(initials).queryByText('Função Exemplo')).toBeNull()

    rerender(<SideMenu items={ITEMS} />)

    expect(
      screen.queryByRole('button', { name: /Pessoa Exemplo/ })
    ).not.toBeInTheDocument()
    expect(getFooter().querySelector('button')).toBeNull()
  })

  it('collapsed profile label (C14)', () => {
    const { rerender } = render(
      <SideMenu collapsed items={ITEMS} user={USER} />
    )
    const profile = screen.getByRole('button', {
      name: 'Pessoa Exemplo, Função Exemplo'
    })

    expect(profile).toHaveAttribute(
      'aria-label',
      'Pessoa Exemplo, Função Exemplo'
    )
    expect(profile).toHaveClass('justify-center', 'p-1')
    for (const utility of ['px-2.5', 'py-2'])
      expect(profile).not.toHaveClass(utility)
    expect(profile.children).toHaveLength(1)
    expect(profile.firstElementChild).toHaveClass('size-8')
    expect(within(profile).queryByText('Pessoa Exemplo')).toBeNull()
    expect(
      within(profile).queryByText(resolveIconName('expand_more'))
    ).toBeNull()

    rerender(
      <SideMenu collapsed items={ITEMS} user={{ name: 'Pessoa Exemplo' }} />
    )

    expect(profile).toHaveAttribute('aria-label', 'Pessoa Exemplo')
  })

  it('profile menu: the profile button opens profileMenuItems above it', () => {
    const onSelect = jest.fn()
    render(
      <SideMenu
        items={ITEMS}
        profileMenuItems={[{ iconName: 'logout', label: 'Sair', onSelect }]}
        user={USER}
      />
    )
    const profile = screen.getByRole('button', { name: /Pessoa Exemplo/ })

    expect(profile).toHaveAttribute('aria-haspopup', 'menu')
    expect(profile).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    fireEvent.click(profile)
    const menu = screen.getByRole('menu', { name: 'Menu do perfil' })

    expect(profile).toHaveAttribute('aria-expanded', 'true')
    expect(menu).toHaveClass('bottom-full', 'mb-1', 'left-0')
    expect(menu).not.toHaveClass('top-full')
    expect(within(menu).getAllByRole('menuitem')).toHaveLength(1)

    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Sair' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('collapsed profile menu: the avatar-only button opens the same menu', () => {
    render(
      <SideMenu
        collapsed
        items={ITEMS}
        profileMenuItems={[{ iconName: 'logout', label: 'Sair' }]}
        user={USER}
      />
    )
    const profile = screen.getByRole('button', {
      name: 'Pessoa Exemplo, Função Exemplo'
    })

    expect(within(profile).queryByText('Pessoa Exemplo')).toBeNull()
    fireEvent.click(profile)
    expect(
      within(screen.getByRole('menu', { name: 'Menu do perfil' })).getByRole(
        'menuitem',
        { name: 'Sair' }
      )
    ).toBeInTheDocument()
  })

  it('profile menu closes on Escape and gives focus back to the profile', () => {
    render(
      <SideMenu
        items={ITEMS}
        profileMenuItems={[{ iconName: 'logout', label: 'Sair' }]}
        user={USER}
      />
    )
    const profile = screen.getByRole('button', { name: /Pessoa Exemplo/ })

    fireEvent.click(profile)
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(profile).toHaveFocus()
    expect(profile).toHaveAttribute('aria-expanded', 'false')
  })
})
