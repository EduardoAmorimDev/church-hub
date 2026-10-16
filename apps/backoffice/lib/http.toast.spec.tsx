import { render, screen, waitFor } from '@testing-library/react'
import { ToastContainer } from '@church/ui/molecules/Toast'
import { apiFetch } from './http'

// why: full replacement — navigate wraps window.location; not available in jsdom test environment.
jest.mock('~/lib/navigate', () => ({ navigate: jest.fn() }))

const GENERIC = 'Algo deu errado. Tente novamente em instantes.'

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

afterEach(() => {
  jest.restoreAllMocks()
})

describe('apiFetch — C34: rendered toasts', () => {
  it('shows a single toast for concurrent failures with the same message', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(jsonResponse({}, 500))
      .mockResolvedValueOnce(jsonResponse({}, 502))
      .mockResolvedValueOnce(jsonResponse({}, 503))
    render(<ToastContainer />)

    await Promise.allSettled([
      apiFetch('/api/members?limit=1'),
      apiFetch('/api/members?limit=1&status=ativo'),
      apiFetch('/api/members?limit=1&status=inativo')
    ])

    await screen.findByText(GENERIC)
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(screen.getAllByText(GENERIC)).toHaveLength(1)
  })

  it('shows one toast per distinct message', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        jsonResponse({ message: 'Falha fictícia A.' }, 422)
      )
      .mockResolvedValueOnce(
        jsonResponse({ message: 'Falha fictícia B.' }, 422)
      )
    render(<ToastContainer />)

    await Promise.allSettled([
      apiFetch('/api/members?a'),
      apiFetch('/api/members?b')
    ])

    await waitFor(() => {
      expect(screen.getAllByText('Falha fictícia A.')).toHaveLength(1)
      expect(screen.getAllByText('Falha fictícia B.')).toHaveLength(1)
    })
  })
})
