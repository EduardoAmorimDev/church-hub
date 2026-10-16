import { GET } from './route'
import { json, mockBackend, refreshed } from '~/test/backend'
import { SESSION_EXPIRED_BODY } from '~/test/routeSession'
import { SESSION_COOKIE } from '~/lib/server/session'
import {
  createCookieStore,
  minutesFromNow,
  sealSession,
  type FakeCookieStore
} from '~/test/session'

let mockCookies: FakeCookieStore

jest.mock('next/headers', () => ({
  cookies: async () => mockCookies.store
}))

// invariant: synthetic tokens only; the signature part is never checked here.
function fakeToken(claims: object): string {
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url')
  return `header-fake.${payload}.assinatura-fake`
}

// hazard: refreshOnce caches a result per refresh token for 10s, so each test
// that renews passes its own token.
async function signedInWith(
  accessToken: string,
  expiresIn = 15,
  refreshToken = 'refresh-fake'
) {
  mockCookies = createCookieStore({
    [SESSION_COOKIE]: await sealSession({
      accessToken,
      accessTokenExpiraEm: minutesFromNow(expiresIn),
      refreshToken,
      rememberMe: false
    })
  })
}

const backendProfile = {
  data: {
    id: 'id-fake-001',
    nome: 'Fulano Teste',
    email: 'fulano@example.test',
    telefone: '(00) 00000-0000',
    gc: null
  }
}

afterEach(() => {
  jest.restoreAllMocks()
})

describe('GET /api/profile — C11: { name, role } from /perfil and the token roles', () => {
  it.each([
    [['admin'], 'admin'],
    [['secretaria'], 'secretaria'],
    [['lider'], 'lider'],
    [['lider', 'secretaria'], 'secretaria'],
    [['lider', 'admin', 'secretaria'], 'admin']
  ])('roles %j → role %s', async (roles, role) => {
    await signedInWith(fakeToken({ sub: 'id-fake-001', roles }))
    const { callsTo } = mockBackend({ '/perfil': [() => json(backendProfile)] })

    const res = await GET()

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      name: 'Fulano Teste',
      role: role
    })
    expect(callsTo('/perfil')).toHaveLength(1)
  })

  it('decodes the renewed token when sessionFetch refreshes first', async () => {
    await signedInWith(fakeToken({ roles: ['lider'] }), 0, 'refresh-renovar')
    mockBackend({
      '/auth/refresh': [
        () => {
          const body = {
            data: {
              accessToken: fakeToken({ roles: ['admin'] }),
              accessTokenExpiraEm: minutesFromNow(15),
              refreshToken: 'refresh-novo'
            }
          }
          return json(body)
        }
      ],
      '/perfil': [() => json(backendProfile)]
    })

    const res = await GET()

    await expect(res.json()).resolves.toEqual({
      name: 'Fulano Teste',
      role: 'admin'
    })
  })
})

describe('GET /api/profile — C12: no decodable role → role null', () => {
  it.each([
    ['a token without a payload', 'access-fake'],
    ['a payload that is not JSON', 'header.bmFvLWpzb24.sig'],
    ['a token without roles', fakeToken({ sub: 'id-fake-001' })],
    ['roles that are not a list', fakeToken({ roles: 'admin' })],
    ['only unknown roles', fakeToken({ roles: ['visitante'] })]
  ])('%s', async (_case, token) => {
    await signedInWith(token)
    mockBackend({ '/perfil': [() => json(backendProfile)] })

    const res = await GET()

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      name: 'Fulano Teste',
      role: null
    })
  })
})

describe('GET /api/profile — C13: only name and role leave the BFF', () => {
  it('drops email, telefone, gc, id and the token', async () => {
    const token = fakeToken({ roles: ['admin'] })
    await signedInWith(token)
    mockBackend({ '/perfil': [() => json(backendProfile)] })

    const res = await GET()
    const text = await res.text()

    expect(Object.keys(JSON.parse(text) as object).sort()).toEqual([
      'name',
      'role'
    ])
    expect(text).not.toContain(token)
  })
})

describe('GET /api/profile — C14: 204 from /perfil → 204 without a body', () => {
  it('answers 204 with an empty body', async () => {
    await signedInWith(fakeToken({ roles: ['admin'] }))
    mockBackend({ '/perfil': [() => new Response(null, { status: 204 })] })

    const res = await GET()

    expect(res.status).toBe(204)
    await expect(res.text()).resolves.toBe('')
  })

  it('answers 204 when the 200 body has no nome', async () => {
    await signedInWith(fakeToken({ roles: ['admin'] }))
    mockBackend({ '/perfil': [() => json({ data: null })] })

    const res = await GET()

    expect(res.status).toBe(204)
  })
})

describe('GET /api/profile — C15: backend errors relayed as-is', () => {
  it('relays 500 with its body', async () => {
    await signedInWith(fakeToken({ roles: ['admin'] }))
    const body = { message: 'Erro interno fictício', statusCode: 500 }
    mockBackend({ '/perfil': [() => json(body, 500)] })

    const res = await GET()

    expect(res.status).toBe(500)
    await expect(res.json()).resolves.toEqual(body)
  })
})

describe('GET /api/profile — C16: no session → 401 without the backend', () => {
  it('answers 401 with the session-expired message', async () => {
    mockCookies = createCookieStore()
    const { fetchSpy } = mockBackend({})

    const res = await GET()

    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toEqual(SESSION_EXPIRED_BODY)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('answers 401 when the refresh is revoked', async () => {
    await signedInWith(fakeToken({ roles: ['admin'] }), 0, 'refresh-revogado')
    mockBackend({
      '/auth/refresh': [() => json({ message: 'Sessão inválida' }, 401)],
      '/perfil': [() => refreshed('nunca')]
    })

    const res = await GET()

    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toEqual(SESSION_EXPIRED_BODY)
  })
})
