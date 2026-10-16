'use client'

import { toast } from 'react-toastify'
import { navigate } from '~/lib/navigate'

type ApiError = { error?: string; message?: string; statusCode?: number }

const GENERIC_ERROR = 'Algo deu errado. Tente novamente em instantes.'
const FORBIDDEN = 'Sem permissão para realizar esta ação.'

// invariant: once the session has expired the page is leaving; every later 401
// must neither navigate again nor toast.
let sessionExpired = false

function notify(message: string): void {
  // why: toastId dedupes a burst of identical failures (e.g. Promise.all).
  toast.error(message, { toastId: message })
}

function messageFor(status: number, body: ApiError): string {
  if (status === 403) return FORBIDDEN
  if (status >= 500) return GENERIC_ERROR
  return body.message ?? GENERIC_ERROR
}

function expireSession(): Promise<never> {
  if (!sessionExpired) {
    sessionExpired = true
    navigate('/login?session=expired')
  }
  // why: the page is unloading; settling would run caller code (and its
  // toasts) against a session that is gone.
  return new Promise<never>(() => {})
}

async function send(url: string, options: RequestInit): Promise<Response> {
  const headers = new Headers(options.headers)
  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let res: Response
  try {
    res = await fetch(url, { ...options, headers })
  } catch (error) {
    notify(GENERIC_ERROR)
    throw error
  }

  if (res.status === 401) return expireSession()

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as ApiError
    notify(messageFor(res.status, body))
    throw new Error(`HTTP ${res.status}`)
  }

  return res
}

/** Same handling as `apiFetch`, but resolves the raw `Response` (e.g. CSV). */
export function apiFetchRaw(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return send(url, options)
}

/**
 * Calls a backoffice route handler. The session travels in the httpOnly
 * cookie; errors are toasted here and then rejected, a 204 resolves `null`,
 * and a 401 sends the user to the login page.
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T | null> {
  const res = await send(url, options)
  if (res.status === 204) return null
  return (await res.json()) as T
}
