import { NextRequest } from 'next/server'
import { GET } from './route'
import { json, mockBackend } from '~/test/backend'
import { SESSION_EXPIRED_BODY, signedInStore } from '~/test/routeSession'
import { createCookieStore, type FakeCookieStore } from '~/test/session'

let mockCookies: FakeCookieStore

jest.mock('next/headers', () => ({
  cookies: async () => mockCookies.store
}))

function makeRequest(search = '') {
  return new NextRequest(
    `http://localhost/api/members/export${search ? `?${search}` : ''}`
  )
}

function csv(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/csv' }
  })
}

beforeEach(async () => {
  mockCookies = await signedInStore()
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('GET /api/members/export — C17: no session → 401 without the backend', () => {
  it('answers 401 with the session-expired message', async () => {
    mockCookies = createCookieStore()
    const { fetchSpy } = mockBackend({})

    const res = await GET(makeRequest())

    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toEqual(SESSION_EXPIRED_BODY)
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

describe('GET /api/members/export — C25: proxies the CSV', () => {
  it('returns 200 with Content-Type text/csv and Content-Disposition attachment', async () => {
    mockBackend({
      '/admin/membros/exportar': [
        () => csv('nome,email\nMembro Fictício,ficticio@example.test')
      ]
    })

    const res = await GET(makeRequest())

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('text/csv; charset=utf-8')
    expect(res.headers.get('content-disposition')).toBe(
      'attachment; filename="membros.csv"'
    )
    await expect(res.text()).resolves.toBe(
      'nome,email\nMembro Fictício,ficticio@example.test'
    )
  })

  it('forwards status and bairro filters to the backend URL', async () => {
    const { callsTo } = mockBackend({
      '/admin/membros/exportar': [() => csv('nome,email')]
    })

    await GET(makeRequest('status=ativo&bairro=Centro'))

    const url = new URL(String(callsTo('/admin/membros/exportar')[0][0]))
    expect(url.searchParams.get('status')).toBe('ativo')
    expect(url.searchParams.get('bairro')).toBe('Centro')
  })
})

describe('GET /api/members/export — C26: backend errors relayed as-is', () => {
  it('returns 500 with the backend body when the backend returns 500', async () => {
    mockBackend({
      '/admin/membros/exportar': [
        () => json({ message: 'Algo deu errado.' }, 500)
      ]
    })

    const res = await GET(makeRequest())

    expect(res.status).toBe(500)
    await expect(res.json()).resolves.toEqual({ message: 'Algo deu errado.' })
  })
})
