import { SESSION_COOKIE, verifySession } from './session'
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

jest.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`)
  }
}))

describe('verifySession — C15: missing or tampered cookie → /login', () => {
  it('redirects to /login when there is no session cookie', async () => {
    mockCookies = createCookieStore()

    await expect(verifySession()).rejects.toThrow('NEXT_REDIRECT /login')
  })

  it('redirects to /login when the cookie does not unseal', async () => {
    mockCookies = createCookieStore({ [SESSION_COOKIE]: 'adulterado~2' })

    await expect(verifySession()).rejects.toThrow('NEXT_REDIRECT /login')
  })

  it('resolves the session when the cookie is valid', async () => {
    mockCookies = createCookieStore({
      [SESSION_COOKIE]: await sealSession({
        accessToken: 'access-fake',
        accessTokenExpiraEm: minutesFromNow(15),
        refreshToken: 'refresh-fake',
        rememberMe: false
      })
    })

    await expect(verifySession()).resolves.toMatchObject({
      accessToken: 'access-fake',
      refreshToken: 'refresh-fake'
    })
  })
})
