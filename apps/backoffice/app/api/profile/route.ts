import { NextResponse } from 'next/server'
import { relayError, sessionFetch } from '~/lib/server/backend'
import { getSession, hasTokens } from '~/lib/server/session'
import type { Role, Profile } from '~/types/profile'

// invariant: the first role found in this order is the one shown.
const PRECEDENCE: ReadonlyArray<Role> = ['admin', 'secretaria', 'lider']

// hazard: the payload is decoded without checking the signature; it only
// picks a label to show, and the backend still authorizes every call.
function roleFromToken(accessToken: string): Role | null {
  const payload = accessToken.split('.')[1]
  if (!payload) return null
  let claims: unknown
  try {
    claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return null
  }
  if (typeof claims !== 'object' || claims === null || !('roles' in claims))
    return null
  const { roles } = claims
  if (!Array.isArray(roles)) return null
  return PRECEDENCE.find(role => roles.includes(role)) ?? null
}

export async function GET() {
  const res = await sessionFetch('/perfil')

  if (res.status === 204) return new NextResponse(null, { status: 204 })
  if (!res.ok) return relayError(res)

  const envelope = (await res.json()) as { data?: { nome?: unknown } }
  const name = envelope.data?.nome
  if (typeof name !== 'string') return new NextResponse(null, { status: 204 })

  // why: read after sessionFetch, so a renewed token is the one decoded.
  const session = await getSession()
  const role = hasTokens(session) ? roleFromToken(session.accessToken) : null

  return NextResponse.json({ name, role } satisfies Profile)
}
