import { apiFetch, apiFetchRaw } from '~/lib/http'
import type {
  MembersResponse,
  PersonDetail,
  PersonInput,
  MemberStatus
} from '~/types/members'

export type ListMembersParams = {
  page?: number
  limit: number
  status?: MemberStatus | null
}

const memberPath = (id: string) => `/api/members/${encodeURIComponent(id)}`

function listMembers({
  page,
  limit,
  status
}: ListMembersParams): Promise<MembersResponse | null> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (page !== undefined) params.set('page', String(page))
  if (status) params.set('status', status)
  return apiFetch<MembersResponse>(`/api/members?${params.toString()}`)
}

/** The person behind a member; `null` when it no longer exists (204). */
async function getMember(id: string): Promise<PersonDetail | null> {
  const result = await apiFetch<{ data: PersonDetail }>(memberPath(id))
  return result?.data ?? null
}

async function createMember(input: PersonInput): Promise<PersonDetail | null> {
  const result = await apiFetch<{ data: PersonDetail }>('/api/members', {
    method: 'POST',
    body: JSON.stringify(input)
  })
  return result?.data ?? null
}

/** `null` when the person no longer exists (204). */
async function updateMember(
  id: string,
  input: PersonInput
): Promise<PersonDetail | null> {
  const result = await apiFetch<{ data: PersonDetail }>(memberPath(id), {
    method: 'PATCH',
    body: JSON.stringify(input)
  })
  return result?.data ?? null
}

/** Resolves `false` when the person no longer exists (204). */
async function deactivateMember(id: string): Promise<boolean> {
  const result = await apiFetch(`${memberPath(id)}/deactivate`, {
    method: 'POST'
  })
  return result !== null
}

async function exportMembers(): Promise<string> {
  const res = await apiFetchRaw('/api/members/export')
  return res.text()
}

export const membersService = {
  list: listMembers,
  get: getMember,
  create: createMember,
  update: updateMember,
  deactivate: deactivateMember,
  export: exportMembers
}
