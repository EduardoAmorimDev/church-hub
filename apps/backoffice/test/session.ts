import { getIronSession } from 'iron-session'
import {
  SESSION_COOKIE,
  sessionOptions,
  type SessionData
} from '~/lib/server/session'

type CookieOptions = {
  maxAge?: number
  expires?: unknown
  httpOnly?: boolean
  sameSite?: unknown
  path?: string
  secure?: boolean
}

export type CookieWrite = {
  name: string
  value: string
  options: CookieOptions
}

/** In-memory stand-in for `await cookies()` that records every write. */
export function createCookieStore(initial: Record<string, string> = {}) {
  const jar = new Map(Object.entries(initial))
  const writes: CookieWrite[] = []
  const deletes: Array<{ name: string; path?: string }> = []

  const store = {
    get: (name: string) => {
      const value = jar.get(name)
      return value === undefined ? undefined : { name, value }
    },
    getAll: () =>
      Array.from(jar.entries(), ([name, value]) => ({ name, value })),
    set: (name: string, value: string, options: CookieOptions = {}) => {
      writes.push({ name, value, options })
      if (options.maxAge === 0) jar.delete(name)
      else jar.set(name, value)
    },
    delete: (cookie: { name: string; path?: string }) => {
      deletes.push(cookie)
      jar.delete(cookie.name)
    }
  }

  const lastWrite = (name = SESSION_COOKIE) =>
    writes.filter(w => w.name === name).at(-1)

  return { store, jar, writes, deletes, lastWrite }
}

export type FakeCookieStore = ReturnType<typeof createCookieStore>

/** Seals `data` the way the app does and returns the cookie value. */
export async function sealSession(data: SessionData): Promise<string> {
  const { store, lastWrite } = createCookieStore()
  const session = await getIronSession<SessionData>(
    store,
    sessionOptions(data.rememberMe)
  )
  Object.assign(session, data)
  await session.save()
  const write = lastWrite()
  if (!write) throw new Error('sealSession: iron-session wrote no cookie')
  return write.value
}

/** Opens a sealed cookie value, or `{}` when it does not unseal. */
export async function unsealSession(
  value: string
): Promise<Partial<SessionData>> {
  const { store } = createCookieStore({ [SESSION_COOKIE]: value })
  const session = await getIronSession<SessionData>(store, sessionOptions(true))
  return {
    accessToken: session.accessToken,
    accessTokenExpiraEm: session.accessTokenExpiraEm,
    refreshToken: session.refreshToken,
    rememberMe: session.rememberMe
  }
}

export function minutesFromNow(minutes: number): string {
  return new Date(Date.now() + minutes * 60_000).toISOString()
}
