import { type NextRequest, NextResponse } from 'next/server'
import { relayError, sessionFetch } from '~/lib/server/backend'
import { toBackendPerson } from '~/lib/server/person'
import { readPersonInput, relayPerson } from '~/lib/server/personRoute'
import type { MemberItem } from '~/types/members'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.toString()
  const res = await sessionFetch(`/admin/membros${query ? `?${query}` : ''}`)

  if (!res.ok) return relayError(res)

  const envelope = (await res.json()) as { data: MemberItem[] }
  const total = parseInt(res.headers.get('pagination-total') ?? '0', 10)
  const page = parseInt(res.headers.get('pagination-page') ?? '1', 10)

  return NextResponse.json({ data: envelope.data, total, page })
}

// hazard: `/core/pessoas` has no guard in the backend; this route is the
// only gate (session) until it gets one (task Unresolved 1, go-live).
export async function POST(request: Request) {
  const input = await readPersonInput(request)
  if (input instanceof NextResponse) return input

  const res = await sessionFetch('/core/pessoas', {
    method: 'POST',
    body: JSON.stringify(toBackendPerson(input))
  })
  return relayPerson(res, 201)
}
