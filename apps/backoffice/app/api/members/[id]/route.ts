import { NextResponse } from 'next/server'
import { sessionFetch } from '~/lib/server/backend'
import { toBackendPerson } from '~/lib/server/person'
import { readPersonInput, relayPerson } from '~/lib/server/personRoute'

type Context = { params: Promise<{ id: string }> }

const personPath = async ({ params }: Context) =>
  `/core/pessoas/${encodeURIComponent((await params).id)}`

export async function GET(_request: Request, context: Context) {
  return relayPerson(await sessionFetch(await personPath(context)))
}

export async function PATCH(request: Request, context: Context) {
  const input = await readPersonInput(request)
  if (input instanceof NextResponse) return input

  // invariant: the backend answers 500 to a PATCH without `genero` and the
  // whole `endereco`; the schema makes both required.
  const res = await sessionFetch(await personPath(context), {
    method: 'PATCH',
    body: JSON.stringify(toBackendPerson(input))
  })
  return relayPerson(res)
}
