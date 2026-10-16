import { type NextRequest, NextResponse } from 'next/server'
import { getIronSession, nextProxyCookies } from 'iron-session'
import {
  hasTokens,
  sessionOptions,
  type SessionData
} from '~/lib/server/session'

// why: optimistic check only (no backend call); pages and route handlers
// still verify the session themselves.
export async function proxy(request: NextRequest) {
  const session = await getIronSession<SessionData>(
    nextProxyCookies(request, NextResponse.next()),
    sessionOptions(true)
  )
  const signedIn = hasTokens(session)

  if (request.nextUrl.pathname === '/login') {
    return signedIn
      ? NextResponse.redirect(new URL('/people', request.url))
      : NextResponse.next()
  }

  return signedIn
    ? NextResponse.next()
    : NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)']
}
