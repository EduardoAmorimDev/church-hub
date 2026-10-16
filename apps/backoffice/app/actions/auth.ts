'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  GENERIC_ERROR_MESSAGE,
  backendFetch,
  readBackendSession
} from '~/lib/server/backend'
import { getSession, hasTokens, saveSession } from '~/lib/server/session'

export type LoginInput = {
  email: string
  password: string
  rememberMe: boolean
}

export type LoginFailure = { message: string }

// why: cookies written by the former /api/auth routes; a delete only matches
// the path they were set with.
const LEGACY_COOKIES = ['refreshToken', 'rememberMe']
const LEGACY_COOKIE_PATH = '/api/auth'

/** Signs in and redirects to /people; resolves `{ message }` only on failure. */
export async function login(
  input: LoginInput
): Promise<LoginFailure | undefined> {
  let res: Response
  try {
    res = await backendFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: input.email, senha: input.password })
    })
  } catch {
    return { message: GENERIC_ERROR_MESSAGE }
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: unknown }
    return {
      message:
        typeof body.message === 'string' && body.message
          ? body.message
          : 'Falha ao fazer login.'
    }
  }

  const backendSession = await readBackendSession(res)
  if (!backendSession) {
    return { message: 'Resposta inválida do servidor de autenticação.' }
  }

  const session = await getSession()
  await saveSession(session, {
    ...backendSession,
    rememberMe: input.rememberMe
  })

  const cookieStore = await cookies()
  for (const name of LEGACY_COOKIES) {
    cookieStore.delete({ name, path: LEGACY_COOKIE_PATH })
  }

  redirect('/people')
}

export async function logout(): Promise<void> {
  const session = await getSession()

  if (hasTokens(session)) {
    await backendFetch('/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.accessToken}` },
      body: JSON.stringify({ refreshToken: session.refreshToken })
    }).catch(() => undefined)
  }

  session.destroy()
  redirect('/login')
}
