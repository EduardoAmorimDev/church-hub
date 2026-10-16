import { apiFetch } from '~/lib/http'
import type { Profile } from '~/types/profile'

/** The signed-in user's name and role; `null` when the backend has no person. */
function get(): Promise<Profile | null> {
  return apiFetch<Profile>('/api/profile')
}

export const profileService = { get }
