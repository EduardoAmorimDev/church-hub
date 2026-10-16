import { NextRequest } from 'next/server'
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'
import { config, proxy } from './proxy'
import { SESSION_COOKIE } from '~/lib/server/session'
import { minutesFromNow, sealSession } from '~/test/session'

function request(path: string, cookie?: string) {
  return new NextRequest(`http://localhost${path}`, {
    headers: cookie ? { cookie: `${SESSION_COOKIE}=${cookie}` } : {}
  })
}

async function validCookie() {
  return sealSession({
    accessToken: 'access-fake',
    accessTokenExpiraEm: minutesFromNow(15),
    refreshToken: 'refresh-fake',
    rememberMe: false
  })
}

function redirectTarget(res: Response): string | null {
  const location = res.headers.get('location')
  return location ? new URL(location).pathname : null
}

describe('proxy — C11: no session → /login', () => {
  it.each(['/', '/people', '/people/id-fake-001'])(
    '%s answers 307 to /login',
    async path => {
      const res = await proxy(request(path))

      expect(res.status).toBe(307)
      expect(redirectTarget(res)).toBe('/login')
    }
  )
})

describe('proxy — C12: signed in → /login sends to /people', () => {
  it('answers 307 to /people', async () => {
    const res = await proxy(request('/login', await validCookie()))

    expect(res.status).toBe(307)
    expect(redirectTarget(res)).toBe('/people')
  })

  it('lets a protected page through', async () => {
    const res = await proxy(request('/people', await validCookie()))

    expect(redirectTarget(res)).toBeNull()
  })
})

describe('proxy — C13: tampered cookie counts as signed out', () => {
  it('sends /people to /login', async () => {
    const res = await proxy(request('/people', 'adulterado~2'))

    expect(res.status).toBe(307)
    expect(redirectTarget(res)).toBe('/login')
  })

  it('lets /login render', async () => {
    const res = await proxy(request('/login', 'adulterado~2'))

    expect(redirectTarget(res)).toBeNull()
  })
})

describe('proxy — C14: matcher', () => {
  it.each([
    ['/api/members', false],
    ['/_next/static/chunk.js', false],
    ['/_next/image', false],
    ['/favicon.ico', false],
    ['/people', true],
    ['/login', true],
    ['/', true]
  ])('%s → runs: %s', (path, runs) => {
    expect(
      unstable_doesMiddlewareMatch({ config, url: `http://localhost${path}` })
    ).toBe(runs)
  })
})

describe('proxy — C8: a signed-in /login lands on /people', () => {
  it('C8 answers 307 with Location /people', async () => {
    const res = await proxy(request('/login', await validCookie()))

    expect(res.status).toBe(307)
    expect(redirectTarget(res)).toBe('/people')
  })
})
