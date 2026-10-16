import { type NextRequest } from 'next/server'
import { sessionFetch } from '~/lib/server/backend'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.toString()
  const res = await sessionFetch(
    `/admin/membros/exportar${query ? `?${query}` : ''}`
  )

  if (!res.ok) {
    return new Response(await res.text(), {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('Content-Type') ?? 'text/plain'
      }
    })
  }

  return new Response(res.body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="membros.csv"'
    }
  })
}
