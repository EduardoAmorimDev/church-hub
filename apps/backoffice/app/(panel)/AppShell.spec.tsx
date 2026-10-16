import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppShell } from './AppShell'

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  usePathname: jest.fn(),
  useSearchParams: jest.fn()
}))

// why: full replacement — the profile request is the subject's input; the
// service has its own spec.
jest.mock('~/services/profile', () => ({
  profileService: { get: jest.fn() }
}))

// why: full replacement — a server action cannot run in jsdom; its own spec
// covers the cookie and the redirect.
jest.mock('~/app/actions/auth', () => ({
  logout: jest.fn()
}))

jest.mock('react-toastify', () => ({
  ...jest.requireActual('react-toastify'),
  toast: { error: jest.fn() }
}))

import {
  ReadonlyURLSearchParams,
  usePathname,
  useSearchParams
} from 'next/navigation'
import { toast } from 'react-toastify'
import { logout } from '~/app/actions/auth'
import { profileService } from '~/services/profile'
import type { Profile } from '~/types/profile'

const mockGet = jest.mocked(profileService.get)

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

function at(pathname: string, query = '') {
  jest.mocked(usePathname).mockReturnValue(pathname)
  jest
    .mocked(useSearchParams)
    .mockReturnValue(new ReadonlyURLSearchParams(query))
}

// invariant: synthetic data only (constitution, Principle V).
const profileWith = (role: Profile['role']): Profile => ({
  name: 'Fulano Teste',
  role
})

const BODY = <p>Conteúdo da página</p>
const navOf = () => screen.getByRole('navigation', { name: 'Menu principal' })
const asideOf = () => screen.getByRole('complementary')
const profileOf = () => screen.queryByRole('button', { name: /Fulano Teste/ })

beforeEach(() => {
  jest.clearAllMocks()
  at('/people')
  mockGet.mockResolvedValue(profileWith('admin'))
})

describe('AppShell — C21: the page renders inside the Page with the SideMenu', () => {
  it('shows the aside with the main menu and the children in <main>', async () => {
    render(<AppShell>{BODY}</AppShell>)

    expect(within(asideOf()).getByRole('navigation')).toBe(navOf())
    expect(
      within(screen.getByRole('main')).getByText('Conteúdo da página')
    ).toBeInTheDocument()
    await waitFor(() => expect(profileOf()).toBeInTheDocument())
  })
})

describe('AppShell — C23: items with href are Next links', () => {
  it('renders an <a href> for every destination', async () => {
    render(<AppShell>{BODY}</AppShell>)

    const hrefs = within(asideOf())
      .getAllByRole('link')
      .map(link => link.getAttribute('href'))

    expect(hrefs).toEqual([
      '/home',
      '/people',
      '/people?tab=visitors',
      '/people?tab=groups',
      '/people?tab=ministries',
      '/teaching',
      '/management',
      '/settings'
    ])
    await waitFor(() => expect(profileOf()).toBeInTheDocument())
  })
})

describe('AppShell — C24: collapse survives a navigation', () => {
  it('starts expanded and stays collapsed when the URL changes', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<AppShell>{BODY}</AppShell>)

    expect(asideOf()).toHaveAttribute('data-collapsed', 'false')
    await user.click(screen.getByRole('button', { name: 'Recolher menu' }))
    expect(asideOf()).toHaveAttribute('data-collapsed', 'true')

    at('/home')
    rerender(<AppShell>{BODY}</AppShell>)

    expect(asideOf()).toHaveAttribute('data-collapsed', 'true')
    expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(mockGet).toHaveBeenCalledTimes(1)
  })
})

describe('AppShell — C25: a query change moves the current sub-item', () => {
  it('goes from Membros to Visitantes without remounting', async () => {
    const { rerender } = render(<AppShell>{BODY}</AppShell>)

    expect(screen.getByRole('link', { name: 'Membros' })).toHaveAttribute(
      'aria-current',
      'page'
    )

    at('/people', 'tab=visitors')
    rerender(<AppShell>{BODY}</AppShell>)

    expect(screen.getByRole('link', { name: 'Visitantes' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(screen.getByRole('link', { name: 'Membros' })).not.toHaveAttribute(
      'aria-current'
    )
    expect(mockGet).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(profileOf()).toBeInTheDocument())
  })
})

describe('AppShell — C28: the signed-in user in the footer', () => {
  it.each([
    ['admin', 'Administrador'],
    ['secretaria', 'Secretaria'],
    ['lider', 'Líder']
  ] as const)('papel %s → "%s"', async (role, label) => {
    mockGet.mockResolvedValue(profileWith(role))
    render(<AppShell>{BODY}</AppShell>)

    const profile = await screen.findByRole('button', { name: /Fulano Teste/ })

    expect(within(profile).getByText('Fulano Teste')).toBeInTheDocument()
    expect(within(profile).getByText(label)).toBeInTheDocument()
    expect(within(profile).getByText('FT')).toBeInTheDocument()
  })

  it('papel null → only the name', async () => {
    mockGet.mockResolvedValue(profileWith(null))
    render(<AppShell>{BODY}</AppShell>)

    const profile = await screen.findByRole('button', { name: /Fulano Teste/ })

    expect(within(profile).getByText('Fulano Teste')).toBeInTheDocument()
    for (const label of ['Administrador', 'Secretaria', 'Líder'])
      expect(within(profile).queryByText(label)).toBeNull()
  })
})

describe('AppShell — C29: no profile while /api/profile is pending', () => {
  it('shows Configurações and no profile button', () => {
    mockGet.mockReturnValue(new Promise<Profile | null>(() => {}))
    render(<AppShell>{BODY}</AppShell>)

    expect(
      screen.getByRole('link', { name: 'Configurações' })
    ).toBeInTheDocument()
    expect(profileOf()).toBeNull()
    expect(
      within(asideOf()).queryByRole('button', { name: /Abrir|menu do perfil/ })
    ).toBeNull()
    expect(screen.queryByText('Administrador')).toBeNull()
  })
})

describe('AppShell — C30: no profile on failure or 204', () => {
  it('a rejected request leaves the footer without profile and no own toast', async () => {
    mockGet.mockRejectedValue(new Error('HTTP 500'))
    render(<AppShell>{BODY}</AppShell>)

    await act(async () => {
      await Promise.resolve()
    })

    expect(mockGet).toHaveBeenCalledTimes(1)
    expect(profileOf()).toBeNull()
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('null (204) leaves the footer without profile', async () => {
    mockGet.mockResolvedValue(null)
    render(<AppShell>{BODY}</AppShell>)

    await act(async () => {
      await Promise.resolve()
    })

    expect(profileOf()).toBeNull()
    expect(toast.error).not.toHaveBeenCalled()
  })
})

describe('AppShell — C32: the profile menu holds only "Sair"', () => {
  it('opens one item, Sair with the logout icon, that calls logout once', async () => {
    const user = userEvent.setup()
    render(<AppShell>{BODY}</AppShell>)

    await user.click(await screen.findByRole('button', { name: /Fulano/ }))
    const menu = screen.getByRole('menu', { name: 'Menu do perfil' })
    const items = within(menu).getAllByRole('menuitem')

    expect(items).toHaveLength(1)
    expect(items[0]).toHaveAccessibleName('Sair')
    expect(within(menu).getByText('logout')).toBeInTheDocument()

    await user.click(within(menu).getByRole('menuitem', { name: 'Sair' }))
    expect(logout).toHaveBeenCalledTimes(1)
  })
})

describe('AppShell — C7: the menu reads `tab`', () => {
  it('C7 ?tab=visitors marks Visitantes; ?aba=visitantes does not', async () => {
    at('/people', 'tab=visitors')
    const { rerender } = render(<AppShell>{BODY}</AppShell>)

    expect(screen.getByRole('link', { name: 'Visitantes' })).toHaveAttribute(
      'aria-current',
      'page'
    )

    at('/people', 'aba=visitantes')
    rerender(<AppShell>{BODY}</AppShell>)

    expect(screen.getByRole('link', { name: 'Membros' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    await waitFor(() => expect(profileOf()).toBeInTheDocument())
  })
})
