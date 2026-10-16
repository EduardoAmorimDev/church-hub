import { POST } from './route'
import { authorizationOf, json, mockBackend } from '~/test/backend'
import { signedInStore } from '~/test/routeSession'
import { createCookieStore, type FakeCookieStore } from '~/test/session'

let mockCookies: FakeCookieStore

jest.mock('next/headers', () => ({
  cookies: async () => mockCookies.store
}))

const PATH = '/admin/membros/fake-id-1/inativar'
const request = () =>
  new Request('http://localhost/api/members/fake-id-1/deactivate', {
    method: 'POST'
  })
const params = { params: Promise.resolve({ id: 'fake-id-1' }) }

beforeEach(async () => {
  mockCookies = await signedInStore()
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('POST /api/members/[id]/deactivate — C21', () => {
  it('C21 calls POST /admin/membros/:id/inativar and answers its data', async () => {
    const { callsTo } = mockBackend({
      [PATH]: [() => json({ data: { idPessoa: 'fake-id-1' } })]
    })

    const res = await POST(request(), params)

    expect(callsTo(PATH)[0][1]?.method).toBe('POST')
    expect(authorizationOf(callsTo(PATH)[0][1])).toBe('Bearer access-fake')
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      data: { idPessoa: 'fake-id-1' }
    })
  })

  it('a missing person (204) answers 204', async () => {
    mockBackend({ [PATH]: [() => new Response(null, { status: 204 })] })

    expect((await POST(request(), params)).status).toBe(204)
  })

  it('relays a 403 with its body', async () => {
    const body = {
      message: 'Acesso restrito para este perfil',
      statusCode: 403
    }
    mockBackend({ [PATH]: [() => json(body, 403)] })

    const res = await POST(request(), params)

    expect(res.status).toBe(403)
    await expect(res.json()).resolves.toEqual(body)
  })

  it('answers 401 without a session', async () => {
    mockCookies = createCookieStore()
    const { fetchSpy } = mockBackend({})

    expect((await POST(request(), params)).status).toBe(401)
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
