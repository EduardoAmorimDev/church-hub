import 'server-only'

import { NextResponse } from 'next/server'
import { GENERIC_ERROR_MESSAGE, relayError } from '~/lib/server/backend'
import { fromBackendPerson } from '~/lib/server/person'
import { personSchema } from '~/lib/personSchema'
import type { PersonInput } from '~/types/members'

export const INVALID_BODY_MESSAGE = 'Dados do membro inválidos.'

/** The validated body, or the 400 to answer with. */
export async function readPersonInput(
  request: Request
): Promise<PersonInput | NextResponse> {
  const parsed = personSchema.safeParse(await request.json().catch(() => null))
  return parsed.success
    ? parsed.data
    : NextResponse.json({ message: INVALID_BODY_MESSAGE }, { status: 400 })
}

/**
 * Answers a `/core/pessoas` response: 204 and errors are relayed, a person
 * is mapped out of the raw entity, and a body that is none is a 502.
 */
export async function relayPerson(
  res: Response,
  status = res.status
): Promise<NextResponse> {
  if (res.status === 204) return new NextResponse(null, { status: 204 })
  if (!res.ok) return relayError(res)
  const body: unknown = await res.json().catch(() => null)
  const person = fromBackendPerson(
    typeof body === 'object' && body !== null && 'data' in body
      ? body.data
      : null
  )
  return person
    ? NextResponse.json({ data: person }, { status })
    : NextResponse.json({ message: GENERIC_ERROR_MESSAGE }, { status: 502 })
}
