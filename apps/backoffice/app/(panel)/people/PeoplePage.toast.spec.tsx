import { render, screen } from '@testing-library/react'
import { ToastContainer } from '@church/ui/molecules/Toast'
import { PeoplePage } from './PeoplePage'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() })
}))

// why: full replacement — navigate wraps window.location; not available in jsdom test environment.
jest.mock('~/lib/navigate', () => ({ navigate: jest.fn() }))

const GENERIC = 'Algo deu errado. Tente novamente em instantes.'

const fakeMember = {
  id: 'id-001',
  nome: 'Membro Fictício 1',
  email: 'ficticio1@example.test',
  telefone: '(00) 00000-0001',
  bairro: 'Bairro A',
  status: 'ativo',
  origemCadastro: 'Cadastro Manual'
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

afterEach(() => {
  jest.restoreAllMocks()
})

describe('PeoplePage — C35: rendered toasts', () => {
  it('a 500 on the three stats shows exactly one toast', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(async input => {
      const url = new URL(String(input), 'http://localhost')
      if (url.searchParams.get('limit') === '1') return jsonResponse({}, 500)
      return jsonResponse({ data: [fakeMember], total: 1, page: 1 })
    })

    render(
      <>
        <PeoplePage />
        <ToastContainer />
      </>
    )

    await screen.findByText('Membro Fictício 1')
    await screen.findByText(GENERIC)
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(screen.getAllByText(GENERIC)).toHaveLength(1)
    expect(screen.queryByText('Erro ao carregar estatísticas.')).toBeNull()
  })
})
