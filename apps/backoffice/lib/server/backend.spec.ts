import { sessionFetch } from './backend'
import { SESSION_COOKIE, type SessionData } from './session'
import { authorizationOf, json, mockBackend, refreshed } from '~/test/backend'
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

const SESSION_EXPIRED = 'Sua sessão expirou. Entre novamente.'
const GENERIC = 'Algo deu errado. Tente novamente em instantes.'

async function useSession(
  data: Partial<SessionData> & { refreshToken: string }
) {
  mockCookies = createCookieStore({
    [SESSION_COOKIE]: await sealSession({
      accessToken: 'access-old',
      accessTokenExpiraEm: minutesFromNow(15),
      rememberMe: false,
      ...data
    })
  })
}

function cookieDestroyed() {
  return mockCookies.lastWrite()?.options.maxAge === 0
}

afterEach(() => {
  jest.useRealTimers()
  jest.restoreAllMocks()
})

describe('sessionFetch — C18: token within its lifetime', () => {
  it('sends the session access token and does not refresh', async () => {
    await useSession({ refreshToken: 'refresh-c18' })
    const { callsTo } = mockBackend({
      '/admin/membros': [() => json({ data: [] })]
    })

    const res = await sessionFetch('/admin/membros')

    expect(res.status).toBe(200)
    expect(authorizationOf(callsTo('/admin/membros')[0][1])).toBe(
      'Bearer access-old'
    )
    expect(callsTo('/auth/refresh')).toHaveLength(0)
  })
})

describe('sessionFetch — C19: 60 s or less left → refresh first', () => {
  it('refreshes, calls with the new token and reseals the cookie keeping rememberMe', async () => {
    await useSession({
      refreshToken: 'refresh-c19',
      accessTokenExpiraEm: new Date(Date.now() + 30_000).toISOString(),
      rememberMe: true
    })
    const { callsTo } = mockBackend({
      '/auth/refresh': [() => refreshed('c19')],
      '/admin/membros': [() => json({ data: [] })]
    })

    await sessionFetch('/admin/membros')

    const [refreshCall] = callsTo('/auth/refresh')
    expect(JSON.parse(String(refreshCall[1]?.body))).toEqual({
      refreshToken: 'refresh-c19'
    })
    expect(authorizationOf(callsTo('/admin/membros')[0][1])).toBe(
      'Bearer access-c19'
    )
    const write = mockCookies.lastWrite()
    expect(write?.options.maxAge).toBe(2592000)
    await expect(unsealSession(write?.value ?? '')).resolves.toMatchObject({
      accessToken: 'access-c19',
      refreshToken: 'refresh-c19',
      rememberMe: true
    })
  })

  it.each([
    ['exactly 60 s left → refresh', 60_000, 1],
    ['60.001 s left → no refresh', 60_001, 0]
  ])('boundary: %s', async (label, msLeft, refreshes) => {
    const now = Date.parse('2030-01-01T12:00:00.000Z')
    jest.useFakeTimers({ now, doNotFake: ['queueMicrotask', 'nextTick'] })
    await useSession({
      refreshToken: `refresh-c19-${msLeft}`,
      accessTokenExpiraEm: new Date(now + msLeft).toISOString()
    })
    const { callsTo } = mockBackend({
      '/auth/refresh': [() => refreshed(`c19-${msLeft}`)],
      '/admin/membros': [() => json({ data: [] })]
    })

    await sessionFetch('/admin/membros')

    expect(callsTo('/auth/refresh')).toHaveLength(refreshes)
  })

  it('treats an already expired token the same way', async () => {
    await useSession({
      refreshToken: 'refresh-c19b',
      accessTokenExpiraEm: minutesFromNow(-5)
    })
    const { callsTo } = mockBackend({
      '/auth/refresh': [() => refreshed('c19b')],
      '/admin/membros': [() => json({ data: [] })]
    })

    await sessionFetch('/admin/membros')

    expect(callsTo('/auth/refresh')).toHaveLength(1)
    expect(authorizationOf(callsTo('/admin/membros')[0][1])).toBe(
      'Bearer access-c19b'
    )
  })
})

describe('sessionFetch — C20: 401 within the lifetime → one refresh, one retry', () => {
  it('retries once with the renewed token', async () => {
    await useSession({ refreshToken: 'refresh-c20' })
    const { callsTo } = mockBackend({
      '/auth/refresh': [() => refreshed('c20')],
      '/admin/membros': [() => json({}, 401), () => json({ data: [] })]
    })

    const res = await sessionFetch('/admin/membros')

    expect(res.status).toBe(200)
    expect(callsTo('/auth/refresh')).toHaveLength(1)
    const dataCalls = callsTo('/admin/membros')
    expect(dataCalls).toHaveLength(2)
    expect(authorizationOf(dataCalls[1][1])).toBe('Bearer access-c20')
  })

  it('destroys the cookie and answers 401 when the retry is 401 again', async () => {
    await useSession({ refreshToken: 'refresh-c20b' })
    const { callsTo } = mockBackend({
      '/auth/refresh': [() => refreshed('c20b')],
      '/admin/membros': [() => json({}, 401)]
    })

    const res = await sessionFetch('/admin/membros')

    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toEqual({ message: SESSION_EXPIRED })
    expect(callsTo('/admin/membros')).toHaveLength(2)
    expect(cookieDestroyed()).toBe(true)
  })
})

describe('sessionFetch — C21: refresh rejected → cookie destroyed, 401', () => {
  it.each([
    ['401', () => json({ message: 'Sessão inválida' }, 401)],
    ['403', () => json({ message: 'Conta inativa' }, 403)],
    ['204', () => new Response(null, { status: 204 })],
    ['corpo inválido', () => json({ data: { accessToken: 'só-um' } })]
  ])('%s', async (label, refreshResponse) => {
    await useSession({
      refreshToken: `refresh-c21-${label}`,
      accessTokenExpiraEm: minutesFromNow(-1)
    })
    const { callsTo } = mockBackend({ '/auth/refresh': [refreshResponse] })

    const res = await sessionFetch('/admin/membros')

    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toEqual({ message: SESSION_EXPIRED })
    expect(cookieDestroyed()).toBe(true)
    expect(callsTo('/admin/membros')).toHaveLength(0)
  })
})

describe('sessionFetch — C22: refresh unavailable → cookie kept', () => {
  it('answers the backend 5xx status with the generic message', async () => {
    await useSession({
      refreshToken: 'refresh-c22',
      accessTokenExpiraEm: minutesFromNow(-1)
    })
    mockBackend({ '/auth/refresh': [() => json({}, 503)] })

    const res = await sessionFetch('/admin/membros')

    expect(res.status).toBe(503)
    await expect(res.json()).resolves.toEqual({ message: GENERIC })
    expect(mockCookies.writes).toHaveLength(0)
  })

  it('answers 502 when the refresh call fails on the network', async () => {
    await useSession({
      refreshToken: 'refresh-c22b',
      accessTokenExpiraEm: minutesFromNow(-1)
    })
    mockBackend({
      '/auth/refresh': [
        () => {
          throw new TypeError('fetch failed')
        }
      ]
    })

    const res = await sessionFetch('/admin/membros')

    expect(res.status).toBe(502)
    await expect(res.json()).resolves.toEqual({ message: GENERIC })
    expect(mockCookies.writes).toHaveLength(0)
  })
})

describe('sessionFetch — C23: one refresh per refresh token within 10 s', () => {
  it('shares a single POST /auth/refresh between concurrent and late requests', async () => {
    jest.useFakeTimers({ doNotFake: ['queueMicrotask', 'nextTick'] })
    const { callsTo } = mockBackend({
      '/auth/refresh': [() => refreshed('c23')],
      '/admin/membros': [() => json({ data: [] })]
    })
    await useSession({
      refreshToken: 'refresh-c23',
      accessTokenExpiraEm: minutesFromNow(-1)
    })
    const preRotationCookie = mockCookies.jar.get(SESSION_COOKIE) ?? ''

    await Promise.all([
      sessionFetch('/admin/membros'),
      sessionFetch('/admin/membros'),
      sessionFetch('/admin/membros')
    ])
    expect(callsTo('/auth/refresh')).toHaveLength(1)

    jest.advanceTimersByTime(9_000)
    mockCookies = createCookieStore({ [SESSION_COOKIE]: preRotationCookie })
    await sessionFetch('/admin/membros')
    expect(callsTo('/auth/refresh')).toHaveLength(1)
    expect(authorizationOf(callsTo('/admin/membros').at(-1)?.[1])).toBe(
      'Bearer access-c23'
    )

    jest.advanceTimersByTime(1_001)
    mockCookies = createCookieStore({ [SESSION_COOKIE]: preRotationCookie })
    await sessionFetch('/admin/membros')
    expect(callsTo('/auth/refresh')).toHaveLength(2)
  })
})
