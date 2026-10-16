import { NextResponse } from 'next/server'
import { relayError, sessionFetch } from '~/lib/server/backend'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const res = await sessionFetch(
    `/admin/membros/${encodeURIComponent(id)}/inativar`,
    { method: 'POST' }
  )

  if (res.status === 204) return new NextResponse(null, { status: 204 })
  if (!res.ok) return relayError(res)

  const body: unknown = await res.json().catch(() => null)
  const data =
    typeof body === 'object' && body !== null && 'data' in body
      ? body.data
      : null
  return NextResponse.json({ data })
}
