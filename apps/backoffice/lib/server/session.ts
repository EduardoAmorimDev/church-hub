import 'server-only'

import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  getIronSession,
  type IronSession,
  type SessionOptions
} from 'iron-session'

export type SessionData = {
  accessToken: string
  accessTokenExpiraEm: string
  refreshToken: string
  rememberMe: boolean
}

export type Session = IronSession<SessionData>

export const SESSION_COOKIE = 'church_session'

// invariant: matches the backend REFRESH_TOKEN_TTL_SECONDS default (30 days).
const REMEMBER_ME_MAX_AGE = 30 * 24 * 60 * 60

function sessionPassword(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be set with at least 32 characters.')
  }
  return secret
}

// hazard: without `rememberMe` iron-session forces ttl 0 (seal never expires);
// the backend refresh token, not the seal, bounds that session.
export function sessionOptions(rememberMe: boolean): SessionOptions {
  return {
    cookieName: SESSION_COOKIE,
    password: sessionPassword(),
    ttl: REMEMBER_ME_MAX_AGE,
    cookieOptions: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: rememberMe ? REMEMBER_ME_MAX_AGE : undefined
    }
  }
}

export function hasTokens(
  session: Partial<SessionData>
): session is SessionData {
  return Boolean(
    session.accessToken && session.accessTokenExpiraEm && session.refreshToken
  )
}

export async function getSession(): Promise<Session> {
  return getIronSession<SessionData>(await cookies(), sessionOptions(true))
}

export async function saveSession(
  session: Session,
  data: SessionData
): Promise<void> {
  session.accessToken = data.accessToken
  session.accessTokenExpiraEm = data.accessTokenExpiraEm
  session.refreshToken = data.refreshToken
  session.rememberMe = data.rememberMe
  session.updateConfig(sessionOptions(data.rememberMe))
  await session.save()
}

export const verifySession = cache(async (): Promise<SessionData> => {
  const session = await getSession()
  if (!hasTokens(session)) redirect('/login')
  return session
})
