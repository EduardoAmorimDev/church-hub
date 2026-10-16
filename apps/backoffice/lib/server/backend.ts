import 'server-only'

import { NextResponse } from 'next/server'
import {
  getSession,
  hasTokens,
  saveSession,
  type Session
} from '~/lib/server/session'

export const BACKEND_URL = process.env.API_URL ?? 'http://localhost:3000'

export const SESSION_EXPIRED_MESSAGE = 'Sua sessão expirou. Entre novamente.'
export const GENERIC_ERROR_MESSAGE =
  'Algo deu errado. Tente novamente em instantes.'

const RENEW_MARGIN_MS = 60_000
// why: a request carrying the old cookie can still arrive after the rotation;
// re-presenting that token makes the backend revoke every session (reuse).
const REFRESH_REUSE_WINDOW_MS = 10_000

export type BackendSession = {
  accessToken: string
  accessTokenExpiraEm: string
  refreshToken: string
}

type RefreshResult =
  | { kind: 'ok'; session: BackendSession }
  | { kind: 'revoked' }
  | { kind: 'unavailable'; status: number }

const refreshesInFlight = new Map<string, Promise<RefreshResult>>()

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

// why: ibfc-server wraps every use-case result as `{ data: <payload> }`
// (HttpInterceptor); login and refresh are no exception.
export async function readBackendSession(
  res: Response
): Promise<BackendSession | null> {
  const body = (await res.json().catch(() => null)) as {
    data?: Partial<Record<keyof BackendSession, unknown>>
  } | null
  const data = body?.data
  if (
    !data ||
    !isNonEmptyString(data.accessToken) ||
    !isNonEmptyString(data.accessTokenExpiraEm) ||
    !isNonEmptyString(data.refreshToken)
  ) {
    return null
  }
  return {
    accessToken: data.accessToken,
    accessTokenExpiraEm: data.accessTokenExpiraEm,
    refreshToken: data.refreshToken
  }
}

export function backendFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers)
  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return fetch(`${BACKEND_URL}${path}`, { ...init, headers })
}

export function sessionExpired(): NextResponse {
  return NextResponse.json(
    { message: SESSION_EXPIRED_MESSAGE },
    { status: 401 }
  )
}

function unavailable(status: number): NextResponse {
  return NextResponse.json({ message: GENERIC_ERROR_MESSAGE }, { status })
}

async function requestRefresh(refreshToken: string): Promise<RefreshResult> {
  let res: Response
  try {
    res = await backendFetch('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    })
  } catch {
    return { kind: 'unavailable', status: 502 }
  }
  if (res.status >= 500) return { kind: 'unavailable', status: res.status }
  if (!res.ok) return { kind: 'revoked' }
  // why: a 204 (credential gone) or a malformed body leaves no usable session,
  // and the old refresh token may already be spent.
  const session = await readBackendSession(res)
  return session ? { kind: 'ok', session } : { kind: 'revoked' }
}

function refreshOnce(refreshToken: string): Promise<RefreshResult> {
  const inFlight = refreshesInFlight.get(refreshToken)
  if (inFlight) return inFlight

  const refresh = requestRefresh(refreshToken)
  refreshesInFlight.set(refreshToken, refresh)
  void refresh.then(result => {
    if (result.kind === 'unavailable') {
      refreshesInFlight.delete(refreshToken)
      return
    }
    const timer = setTimeout(
      () => refreshesInFlight.delete(refreshToken),
      REFRESH_REUSE_WINDOW_MS
    )
    // why: the reuse window must not keep a serverless or test process alive.
    timer.unref()
  })
  return refresh
}

async function renew(session: Session): Promise<string | NextResponse> {
  if (!hasTokens(session)) return sessionExpired()
  const result = await refreshOnce(session.refreshToken)
  if (result.kind === 'unavailable') return unavailable(result.status)
  if (result.kind === 'revoked') {
    session.destroy()
    return sessionExpired()
  }
  await saveSession(session, {
    ...result.session,
    rememberMe: session.rememberMe
  })
  return result.session.accessToken
}

function expiresSoon(expiry: string): boolean {
  const expiresAt = Date.parse(expiry)
  return Number.isNaN(expiresAt) || expiresAt - Date.now() <= RENEW_MARGIN_MS
}

async function sendWithToken(
  path: string,
  init: RequestInit,
  token: string
): Promise<Response> {
  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${token}`)
  try {
    return await backendFetch(path, { ...init, headers })
  } catch {
    return unavailable(502)
  }
}

/**
 * Calls ibfc-server as the signed-in user: token from the sealed session,
 * renewed before it expires and once more on a 401. Session failures come
 * back as a 401 `{ message }` response, ready to relay to the browser.
 */
export async function sessionFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const session = await getSession()
  if (!hasTokens(session)) return sessionExpired()

  let token = session.accessToken
  if (expiresSoon(session.accessTokenExpiraEm)) {
    const renewed = await renew(session)
    if (renewed instanceof NextResponse) return renewed
    token = renewed
  }

  const res = await sendWithToken(path, init, token)
  if (res.status !== 401) return res

  const renewed = await renew(session)
  if (renewed instanceof NextResponse) return renewed
  const retried = await sendWithToken(path, init, renewed)
  if (retried.status !== 401) return retried

  session.destroy()
  return sessionExpired()
}

/** Relays a backend error to the browser with its status and JSON body. */
export async function relayError(res: Response): Promise<NextResponse> {
  const body: unknown = await res.json().catch(() => ({}))
  return NextResponse.json(body, { status: res.status })
}
