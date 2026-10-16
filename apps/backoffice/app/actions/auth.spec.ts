import { login, logout } from './auth'
import { SESSION_COOKIE } from '~/lib/server/session'
import { authorizationOf, json, mockBackend } from '~/test/backend'
import {
  createCookieStore,
  minutesFromNow,
  sealSession,
  unsealSession,
  type FakeCookieStore
} from '~/test/session'

let mockCookies: FakeCookieStore

jest.mock('next/headers', () => ({
  cookies: async () => mockCookies.store
}))

jest.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`)
  }
}))

const CREDENTIALS = { email: 'admin@example.test', password: 'SenhaFake123' }

function loginOk() {
  return json({
    data: {
      accessToken: 'access-fake-login',
      accessTokenExpiraEm: minutesFromNow(15),
      refreshToken: 'refresh-fake-login'
    }
  })
}

beforeEach(() => {
  mockCookies = createCookieStore()
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('login — C1: valid credentials → sealed cookie + /people', () => {
  it('stores the three tokens in church_session and redirects', async () => {
    const { callsTo } = mockBackend({ '/auth/login': [loginOk] })

    await expect(login({ ...CREDENTIALS, rememberMe: false })).rejects.toThrow(
      'NEXT_REDIRECT /people'
    )

    expect(JSON.parse(String(callsTo('/auth/login')[0][1]?.body))).toEqual({
      email: CREDENTIALS.email,
      senha: CREDENTIALS.password
    })
    expect(mockCookies.writes.map(w => w.name)).toEqual(['church_session'])
    const write = mockCookies.writes[0]
    expect(write?.options).toMatchObject({
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: false
    })
    await expect(unsealSession(write?.value ?? '')).resolves.toEqual({
      accessToken: 'access-fake-login',
      accessTokenExpiraEm: expect.any(String),
      refreshToken: 'refresh-fake-login',
      rememberMe: false
    })
  })

  it('marks the cookie Secure when NODE_ENV is production', async () => {
    jest.replaceProperty(process, 'env', {
      ...process.env,
      NODE_ENV: 'production'
    })
    mockBackend({ '/auth/login': [loginOk] })

    await expect(login({ ...CREDENTIALS, rememberMe: false })).rejects.toThrow(
      'NEXT_REDIRECT /people'
    )

    expect(mockCookies.writes[0]?.options.secure).toBe(true)
  })

  it('deletes the legacy /api/auth cookies', async () => {
    mockBackend({ '/auth/login': [loginOk] })

    await expect(login({ ...CREDENTIALS, rememberMe: false })).rejects.toThrow(
      'NEXT_REDIRECT /people'
    )

    expect(mockCookies.deletes).toEqual([
      { name: 'refreshToken', path: '/api/auth' },
      { name: 'rememberMe', path: '/api/auth' }
    ])
  })
})

describe('login — C2: no token reaches the browser', () => {
  it('returns no value on success and the cookie holds no plain token', async () => {
    mockBackend({ '/auth/login': [loginOk] })

    const outcome = await login({ ...CREDENTIALS, rememberMe: false }).then(
      value => ({ value }),
      (error: Error) => ({ error: error.message })
    )

    expect(outcome).toEqual({ error: 'NEXT_REDIRECT /people' })
    const sealed = mockCookies.lastWrite()?.value ?? ''
    expect(sealed).not.toContain('access-fake-login')
    expect(sealed).not.toContain('refresh-fake-login')
  })
})

describe('login — C3: rememberMe decides the cookie lifetime', () => {
  it('sets Max-Age=2592000 with rememberMe', async () => {
    mockBackend({ '/auth/login': [loginOk] })

    await login({ ...CREDENTIALS, rememberMe: true }).catch(() => undefined)

    expect(mockCookies.lastWrite()?.options.maxAge).toBe(2592000)
  })

  it('sets neither Max-Age nor Expires without rememberMe', async () => {
    mockBackend({ '/auth/login': [loginOk] })

    await login({ ...CREDENTIALS, rememberMe: false }).catch(() => undefined)

    const options = mockCookies.lastWrite()?.options
    expect(options?.maxAge).toBeUndefined()
    expect(options?.expires).toBeUndefined()
  })
})

describe('login — C4: backend refuses → message, no cookie', () => {
  it('returns the backend message on 401', async () => {
    mockBackend({
      '/auth/login': [
        () => json({ message: 'E-mail ou senha inválidos.' }, 401)
      ]
    })

    await expect(login({ ...CREDENTIALS, rememberMe: false })).resolves.toEqual(
      {
        message: 'E-mail ou senha inválidos.'
      }
    )
    expect(mockCookies.writes).toHaveLength(0)
  })

  it('falls back to "Falha ao fazer login." when no message comes', async () => {
    mockBackend({ '/auth/login': [() => json({}, 423)] })

    await expect(login({ ...CREDENTIALS, rememberMe: false })).resolves.toEqual(
      {
        message: 'Falha ao fazer login.'
      }
    )
    expect(mockCookies.writes).toHaveLength(0)
  })
})

describe('login — C5: 2xx without the three fields', () => {
  it('returns the invalid-response message and writes no cookie', async () => {
    mockBackend({
      '/auth/login': [() => json({ data: { accessToken: 'access-fake' } })]
    })

    await expect(login({ ...CREDENTIALS, rememberMe: false })).resolves.toEqual(
      {
        message: 'Resposta inválida do servidor de autenticação.'
      }
    )
    expect(mockCookies.writes).toHaveLength(0)
  })
})

describe('login — C6: network failure', () => {
  it('returns the generic message without throwing', async () => {
    mockBackend({
      '/auth/login': [
        () => {
          throw new TypeError('fetch failed')
        }
      ]
    })

    await expect(login({ ...CREDENTIALS, rememberMe: false })).resolves.toEqual(
      {
        message: 'Algo deu errado. Tente novamente em instantes.'
      }
    )
    expect(mockCookies.writes).toHaveLength(0)
  })
})

async function signedIn() {
  mockCookies = createCookieStore({
    [SESSION_COOKIE]: await sealSession({
      accessToken: 'access-fake-logout',
      accessTokenExpiraEm: minutesFromNow(15),
      refreshToken: 'refresh-fake-logout',
      rememberMe: true
    })
  })
}

describe('logout — C8: revokes, destroys and redirects', () => {
  it('posts the refresh token with the bearer, clears the cookie, goes to /login', async () => {
    await signedIn()
    const { callsTo } = mockBackend({ '/auth/logout': [() => json({})] })

    await expect(logout()).rejects.toThrow('NEXT_REDIRECT /login')

    const [call] = callsTo('/auth/logout')
    expect(call[1]?.method).toBe('POST')
    expect(JSON.parse(String(call[1]?.body))).toEqual({
      refreshToken: 'refresh-fake-logout'
    })
    expect(authorizationOf(call[1])).toBe('Bearer access-fake-logout')
    expect(mockCookies.lastWrite()?.options.maxAge).toBe(0)
  })
})

describe('logout — C9: backend failure does not keep the session', () => {
  it('still clears the cookie and redirects when the backend call rejects', async () => {
    await signedIn()
    mockBackend({
      '/auth/logout': [
        () => {
          throw new TypeError('fetch failed')
        }
      ]
    })

    await expect(logout()).rejects.toThrow('NEXT_REDIRECT /login')
    expect(mockCookies.lastWrite()?.options.maxAge).toBe(0)
  })

  it('still clears the cookie and redirects when the backend answers 500', async () => {
    await signedIn()
    const { callsTo } = mockBackend({
      '/auth/logout': [() => json({ message: 'Algo deu errado.' }, 500)]
    })

    await expect(logout()).rejects.toThrow('NEXT_REDIRECT /login')
    expect(callsTo('/auth/logout')).toHaveLength(1)
    expect(mockCookies.lastWrite()?.options.maxAge).toBe(0)
  })
})

describe('logout — C10: no session', () => {
  it('redirects to /login without calling the backend', async () => {
    const { fetchSpy } = mockBackend({})

    await expect(logout()).rejects.toThrow('NEXT_REDIRECT /login')
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
