import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Badge } from '@church/ui/atoms/Badge'
import { PeoplePage } from './PeoplePage'

jest.mock('react-toastify', () => ({
  ...jest.requireActual('react-toastify'),
  toast: { error: jest.fn() }
}))

jest.mock('@church/ui/molecules/Toast', () => ({
  ...jest.requireActual('@church/ui/molecules/Toast'),
  toast: { success: jest.fn(), error: jest.fn() }
}))

// why: full replacement — apiFetch must be controlled per test; no real http in unit tests.
jest.mock('~/lib/http', () => ({
  apiFetch: jest.fn(),
  apiFetchRaw: jest.fn()
}))

import { toast as dsToast } from '@church/ui/molecules/Toast'
import { apiFetch } from '~/lib/http'
import { toast } from 'react-toastify'
import { fakePersonInput } from '~/test/person'

const mockApiFetch = jest.mocked(apiFetch)

// invariant: synthetic data only (constitution, Principle V).
const fakeMembers = [
  {
    id: 'id-001',
    nome: 'Pessoa Exemplo',
    email: 'pessoa@example.test',
    telefone: '11900000001',
    bairro: 'Bairro A',
    status: 'ativo',
    origemCadastro: 'web'
  },
  {
    id: 'id-002',
    nome: 'Outra Pessoa',
    email: null,
    telefone: '0000',
    bairro: null,
    status: 'inativo',
    origemCadastro: 'app'
  }
]

const listCalls = () =>
  mockApiFetch.mock.calls.filter(([url]) => url.includes('limit=10')).length

function setupDefaultMocks() {
  mockApiFetch.mockImplementation(async (url: string) => {
    if (url.endsWith('/deactivate')) return { data: { idPessoa: 'id-001' } }
    if (url.startsWith('/api/members/'))
      return { data: { ...fakePersonInput, id: 'id-001', status: 'ativo' } }
    const params = new URLSearchParams(url.split('?')[1] ?? '')
    if (params.get('status') === 'ativo') return { data: [], total: 5, page: 1 }
    if (params.get('status') === 'inativo')
      return { data: [], total: 3, page: 1 }
    if (params.get('limit') === '1') return { data: [], total: 42, page: 1 }
    return { data: fakeMembers, total: 2, page: 1 }
  })
}

const renderLoaded = async () => {
  setupDefaultMocks()
  render(<PeoplePage />)
  await screen.findByText('Pessoa Exemplo')
}

const rowOf = (name: string) => {
  const row = screen.getByText(name).closest('tr')
  if (!row) throw new Error(`no row for ${name}`)
  return within(row)
}

const openMenuOf = async (name: string) => {
  await userEvent.click(rowOf(name).getByRole('button', { name: 'Mais ações' }))
  return screen.getByRole('menu', { name: 'Mais ações' })
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('PeoplePage — C37: StatCards', () => {
  it('renders three StatCards with — before data arrives', () => {
    mockApiFetch.mockImplementation(() => new Promise(() => {}))
    render(<PeoplePage />)

    expect(screen.getByText('Total de membros')).toBeInTheDocument()
    expect(screen.getByText('Ativos')).toBeInTheDocument()
    expect(screen.getByText('Inativos')).toBeInTheDocument()
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(3)
  })

  it('fills each StatCard with its own total once loaded', async () => {
    await renderLoaded()

    const card = (name: string) => screen.getByRole('article', { name })
    await waitFor(() =>
      expect(within(card('Total de membros')).getByText('42')).toBeVisible()
    )
    expect(within(card('Ativos')).getByText('5')).toBeVisible()
    expect(within(card('Inativos')).getByText('3')).toBeVisible()
  })

  it('leaves a stats failure to the HTTP layer and keeps the cards on —', async () => {
    mockApiFetch.mockImplementation(async (url: string) => {
      if (/limit=1(&|$)/.test(url)) throw new Error('HTTP 500')
      return { data: fakeMembers, total: 2, page: 1 }
    })
    render(<PeoplePage />)

    await screen.findByText('Pessoa Exemplo')
    expect(toast.error).not.toHaveBeenCalled()
    expect(screen.getAllByText('—')).toHaveLength(3)
  })
})

describe('PeoplePage — C5: the table toolbar', () => {
  it('C5 shows a disabled search, "Adicionar membro" and no filters', async () => {
    await renderLoaded()
    const region = screen.getByRole('region', { name: 'Membros' })
    const search = within(region).getByPlaceholderText('Buscar membro')
    const add = within(region).getByRole('button', { name: /Adicionar membro/ })

    expect(search).toBeDisabled()
    expect(add).toHaveTextContent('add')
    expect(
      within(region).queryByRole('button', { name: /Bairro/ })
    ).not.toBeInTheDocument()
    expect(
      within(region).queryByRole('button', { name: 'Ativo' })
    ).not.toBeInTheDocument()
    expect(
      within(region).queryByRole('button', { name: 'Inativo' })
    ).not.toBeInTheDocument()
    expect(
      within(region).getByRole('heading', { name: 'Membros' })
    ).toHaveClass('sr-only')
  })

  it('C5 the search never requests anything', async () => {
    await renderLoaded()
    const calls = mockApiFetch.mock.calls.length

    await userEvent.type(screen.getByPlaceholderText('Buscar membro'), 'ana')

    expect(screen.getByPlaceholderText('Buscar membro')).toHaveValue('')
    expect(mockApiFetch.mock.calls.length).toBe(calls)
  })
})

describe('PeoplePage — C37: loading, empty, paginator', () => {
  it('shows "Nenhum membro encontrado" when the list is empty', async () => {
    mockApiFetch.mockResolvedValue({ data: [], total: 0, page: 1 })
    render(<PeoplePage />)

    expect(
      await screen.findByText('Nenhum membro encontrado')
    ).toBeInTheDocument()
  })

  it('renders the Paginator with the total from the BFF', async () => {
    mockApiFetch.mockResolvedValue({ data: fakeMembers, total: 50, page: 1 })
    render(<PeoplePage />)

    expect(await screen.findByText('1-10 de 50 itens')).toBeInTheDocument()
  })
})

describe('PeoplePage — C7–C13: columns and cells', () => {
  it('C7 renders the six headers in order', async () => {
    await renderLoaded()

    // hazard: the Table gives the non-reorderable "Ações" <th> dnd-kit's
    // role="button", so the header cells are read from the markup.
    const headers = Array.from(
      document.querySelectorAll('thead th'),
      header => header.textContent ?? ''
    )
    const labels = [
      'Membro',
      'Contato',
      'Grupo de Crescimento',
      'Data de ingresso',
      'Situação',
      'Ações'
    ]
    expect(headers).toHaveLength(labels.length)
    labels.forEach((label, index) => expect(headers[index]).toContain(label))
  })

  it('C8 shows the avatar initials beside the name', async () => {
    await renderLoaded()

    expect(rowOf('Pessoa Exemplo').getByText('PE')).toBeInTheDocument()
  })

  it('C9 shows the e-mail over the formatted phone; no e-mail → phone only', async () => {
    await renderLoaded()

    const first = rowOf('Pessoa Exemplo')
    const email = first.getByText('pessoa@example.test')
    const phone = first.getByText('(11) 9 0000-0001')
    expect(
      email.compareDocumentPosition(phone) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    const contact = screen
      .getAllByRole('cell')
      .filter((_, index) => index % 6 === 1)
    expect(contact.map(cell => cell.textContent)).toEqual([
      'pessoa@example.test(11) 9 0000-0001',
      '0000'
    ])
  })

  it('C10 every Grupo de Crescimento cell reads "a fazer"', async () => {
    await renderLoaded()

    const cells = screen.getAllByRole('cell')
    const group = cells.filter((_, index) => index % 6 === 2)
    expect(group.map(cell => cell.textContent)).toEqual(['a fazer', 'a fazer'])
  })

  it('C11 every Data de ingresso cell reads "a fazer"', async () => {
    await renderLoaded()

    const cells = screen.getAllByRole('cell')
    const joinedAt = cells.filter((_, index) => index % 6 === 3)
    expect(joinedAt.map(cell => cell.textContent)).toEqual([
      'a fazer',
      'a fazer'
    ])
  })

  it('C12 shows a neutral Badge, same style for Ativo and Inativo', async () => {
    await renderLoaded()

    const active = rowOf('Pessoa Exemplo').getByText('Ativo')
    const inactive = rowOf('Outra Pessoa').getByText('Inativo')
    render(<Badge color="neutral">Referência</Badge>)
    const neutral = screen.getByText('Referência').className

    expect(active.className).toBe(neutral)
    expect(inactive.className).toBe(neutral)
  })

  it('C13 has "Ver membro" and "Mais ações" buttons and no "Ver perfil"', async () => {
    await renderLoaded()
    const row = rowOf('Pessoa Exemplo')

    expect(row.getByRole('button', { name: 'Ver membro' })).toBeInTheDocument()
    expect(row.getByRole('button', { name: 'Mais ações' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Ver perfil' })
    ).not.toBeInTheDocument()
  })
})

describe('PeoplePage — C14–C16: the member drawer', () => {
  it('C14 "Ver membro" opens the drawer with the row data', async () => {
    await renderLoaded()

    await userEvent.click(
      rowOf('Pessoa Exemplo').getByRole('button', { name: 'Ver membro' })
    )
    const drawer = within(
      screen.getByRole('dialog', { name: 'Pessoa Exemplo' })
    )

    expect(drawer.getByText('Ativo')).toBeInTheDocument()
    expect(drawer.getByRole('button', { name: /Editar/ })).toBeInTheDocument()
    expect(
      drawer.getByRole('heading', { name: 'Informações de Contato' })
    ).toBeInTheDocument()
    expect(drawer.getByText('Telefone')).toBeInTheDocument()
    expect(drawer.getByText('(11) 9 0000-0001')).toBeInTheDocument()
    expect(drawer.getByText('pessoa@example.test')).toBeInTheDocument()
    expect(drawer.getByText('Endereço')).toBeInTheDocument()
    expect(drawer.getByText('Bairro A')).toBeInTheDocument()
  })

  it('C15 "Editar" closes the drawer and opens "Editar membro"', async () => {
    await renderLoaded()
    await userEvent.click(
      rowOf('Pessoa Exemplo').getByRole('button', { name: 'Ver membro' })
    )

    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'Pessoa Exemplo' })).getByRole(
        'button',
        { name: /Editar/ }
      )
    )

    expect(
      screen.queryByRole('dialog', { name: 'Pessoa Exemplo' })
    ).not.toBeInTheDocument()
    expect(
      await screen.findByRole('dialog', { name: 'Editar membro' })
    ).toBeInTheDocument()
    expect(mockApiFetch).toHaveBeenCalledWith('/api/members/id-001')
  })

  it('C16 Esc closes the drawer and returns focus to "Ver membro"', async () => {
    await renderLoaded()
    const viewButton = rowOf('Pessoa Exemplo').getByRole('button', {
      name: 'Ver membro'
    })

    await userEvent.click(viewButton)
    await userEvent.keyboard('{Escape}')

    expect(
      screen.queryByRole('dialog', { name: 'Pessoa Exemplo' })
    ).not.toBeInTheDocument()
    await waitFor(() => expect(viewButton).toHaveFocus())
  })
})

describe('PeoplePage — C18–C23: actions menu and inactivation', () => {
  it('C18 "Mais ações" opens a menu with Editar and Inativar, both neutral', async () => {
    await renderLoaded()

    const menu = within(await openMenuOf('Pessoa Exemplo'))
    const items = menu.getAllByRole('menuitem')

    expect(items.map(item => item.textContent)).toEqual([
      'editEditar',
      'person_offInativar'
    ])
    items.forEach(item => {
      expect(item).toHaveClass('text-primary')
      expect(item).not.toHaveClass('text-danger')
    })
  })

  it('C20 "Editar" opens "Editar membro" for that member', async () => {
    await renderLoaded()

    await userEvent.click(
      within(await openMenuOf('Pessoa Exemplo')).getByRole('menuitem', {
        name: /Editar/
      })
    )

    expect(
      await screen.findByRole('dialog', { name: 'Editar membro' })
    ).toBeInTheDocument()
    expect(mockApiFetch).toHaveBeenCalledWith('/api/members/id-001')
  })

  it('C21 "Inativar" calls the BFF without a dialog, toasts and reloads', async () => {
    await renderLoaded()
    await waitFor(() => expect(listCalls()).toBe(1))
    const isStat = (url: string) => /limit=1(&|$)/.test(url)
    const statsCalls = mockApiFetch.mock.calls.filter(([url]) =>
      isStat(url)
    ).length

    await userEvent.click(
      within(await openMenuOf('Pessoa Exemplo')).getByRole('menuitem', {
        name: /Inativar/
      })
    )

    expect(mockApiFetch).toHaveBeenCalledWith(
      '/api/members/id-001/deactivate',
      {
        method: 'POST'
      }
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await waitFor(() =>
      expect(dsToast.success).toHaveBeenCalledWith({
        title: 'Membro inativado.'
      })
    )
    await waitFor(() => expect(listCalls()).toBe(2))
    expect(mockApiFetch.mock.calls.filter(([url]) => isStat(url)).length).toBe(
      statsCalls * 2
    )
  })

  it('C22 "Inativar" is disabled for an inactive member', async () => {
    await renderLoaded()

    const menu = within(await openMenuOf('Outra Pessoa'))

    expect(menu.getByRole('menuitem', { name: /Inativar/ })).toBeDisabled()
    expect(menu.getByRole('menuitem', { name: /Editar/ })).toBeEnabled()
  })

  it('C23 a failed inactivation neither toasts success nor reloads', async () => {
    await renderLoaded()
    await waitFor(() => expect(listCalls()).toBe(1))
    const base = mockApiFetch.getMockImplementation()
    mockApiFetch.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.endsWith('/deactivate')) throw new Error('HTTP 500')
      return base?.(url, init)
    })

    await userEvent.click(
      within(await openMenuOf('Pessoa Exemplo')).getByRole('menuitem', {
        name: /Inativar/
      })
    )

    await waitFor(() =>
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/members/id-001/deactivate',
        { method: 'POST' }
      )
    )
    expect(dsToast.success).not.toHaveBeenCalled()
    expect(listCalls()).toBe(1)
  })

  it('C23 a 204 (member gone) reloads without a success toast', async () => {
    await renderLoaded()
    await waitFor(() => expect(listCalls()).toBe(1))
    const base = mockApiFetch.getMockImplementation()
    mockApiFetch.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.endsWith('/deactivate')) return null
      return base?.(url, init)
    })

    await userEvent.click(
      within(await openMenuOf('Pessoa Exemplo')).getByRole('menuitem', {
        name: /Inativar/
      })
    )

    await waitFor(() => expect(listCalls()).toBe(2))
    expect(dsToast.success).not.toHaveBeenCalled()
  })
})

describe('PeoplePage — C24: "Adicionar membro" opens the form', () => {
  it('C24 opens the "Adicionar membro" dialog', async () => {
    await renderLoaded()

    await userEvent.click(
      screen.getByRole('button', { name: /Adicionar membro/ })
    )

    expect(
      screen.getByRole('dialog', { name: 'Adicionar membro' })
    ).toBeInTheDocument()
  })
})
