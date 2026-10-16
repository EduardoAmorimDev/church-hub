import { render, screen, within } from '@testing-library/react'
import PeopleRoute from './page'

// why: full replacement — the session check is the subject; its own logic is covered in lib/server.
jest.mock('~/lib/server/session', () => ({
  verifySession: jest.fn()
}))

// why: full replacement — the list has its own spec; here only the route's composition matters.
jest.mock('./PeoplePage', () => ({
  PeoplePage: () => <p>Lista de membros</p>
}))

import { verifySession } from '~/lib/server/session'

const mockVerifySession = jest.mocked(verifySession)

const session = {
  accessToken: 'access-fake',
  accessTokenExpiraEm: '2999-01-01T00:00:00Z',
  refreshToken: 'refresh-fake',
  rememberMe: false
}

const withoutTab = () => ({ searchParams: Promise.resolve({}) })
const withTab = (tab: string | string[]) => ({
  searchParams: Promise.resolve({ tab })
})

const renderRoute = async (props: ReturnType<typeof withoutTab>) =>
  render(await PeopleRoute(props))

const tabsOf = () =>
  within(screen.getByRole('navigation', { name: 'Seções de pessoas' }))

beforeEach(() => {
  jest.clearAllMocks()
  mockVerifySession.mockResolvedValue(session)
})

describe('people page — C16: verifySession guards the render', () => {
  it('/people does not render when verifySession redirects', async () => {
    mockVerifySession.mockRejectedValue(new Error('NEXT_REDIRECT /login'))

    await expect(PeopleRoute(withoutTab())).rejects.toThrow(
      'NEXT_REDIRECT /login'
    )
  })
})

describe('people page — C1: header without padding wrapper or buttons', () => {
  it('C1 renders the h1 in the PageHeader, first in the page, with no extra buttons', async () => {
    const { container } = await renderRoute(withoutTab())
    const heading = screen.getByRole('heading', {
      level: 1,
      name: 'Gestão de pessoas'
    })

    expect(container.firstElementChild).toBe(screen.getByRole('banner'))
    expect(screen.getByRole('banner')).toContainElement(heading)
    expect(container.firstElementChild).not.toHaveClass('p-6')
    expect(
      screen.queryByRole('button', { name: 'Adicionar pessoa' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Exportar base' })
    ).not.toBeInTheDocument()
  })
})

describe('people page — C2/C4: tabs navigate between the tabs', () => {
  it('C2 renders the four tabs as links, in order', async () => {
    await renderRoute(withoutTab())

    expect(
      tabsOf()
        .getAllByRole('link')
        .map(link => [link.textContent, link.getAttribute('href')])
    ).toEqual([
      ['Membros', '/people'],
      ['Visitantes', '/people?tab=visitors'],
      ['Grupos de Crescimento', '/people?tab=groups'],
      ['Ministérios', '/people?tab=ministries']
    ])
    expect(tabsOf().getByRole('link', { name: 'Membros' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(screen.getByText('Lista de membros')).toBeInTheDocument()
  })

  it.each([
    ['visitors', 'Visitantes'],
    ['groups', 'Grupos de Crescimento'],
    ['ministries', 'Ministérios']
  ])(
    'C4 ?tab=%s keeps the header and tabs and shows "Em construção" below',
    async (tab, label) => {
      await renderRoute(withTab(tab))

      expect(
        screen.getByRole('heading', { level: 1, name: 'Gestão de pessoas' })
      ).toBeInTheDocument()
      expect(tabsOf().getByRole('link', { name: label })).toHaveAttribute(
        'aria-current',
        'page'
      )
      const nav = screen.getByRole('navigation', { name: 'Seções de pessoas' })
      const underConstruction = screen.getByText('Em construção')
      expect(
        nav.compareDocumentPosition(underConstruction) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy()
      expect(screen.getByRole('banner')).not.toContainElement(underConstruction)
      expect(screen.queryByText('Lista de membros')).not.toBeInTheDocument()
    }
  )

  it.each([
    ['tab=members', withTab('members')],
    ['an unknown tab', withTab('xyz')],
    ['a repeated tab', withTab(['visitors', 'groups'])]
  ])('%s renders the members list', async (_case, props) => {
    await renderRoute(props)

    expect(screen.getByText('Lista de membros')).toBeInTheDocument()
  })
})

describe('people page — C7: the route reads `tab`', () => {
  it('C7 ?tab=visitors marks Visitantes as the current tab', async () => {
    await renderRoute(withTab('visitors'))

    expect(tabsOf().getByRole('link', { name: 'Visitantes' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(screen.queryByText('Lista de membros')).not.toBeInTheDocument()
  })
})
