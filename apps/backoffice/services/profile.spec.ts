import { profileService } from './profile'

// why: full replacement — apiFetch is the boundary under test; no real http in unit tests.
jest.mock('~/lib/http', () => ({
  apiFetch: jest.fn()
}))

import { apiFetch } from '~/lib/http'

const mockApiFetch = jest.mocked(apiFetch)

beforeEach(() => {
  jest.clearAllMocks()
})

describe('profileService.get — C31: GET /api/profile through apiFetch', () => {
  it('resolves the body of /api/profile', async () => {
    mockApiFetch.mockResolvedValue({ name: 'Fulano Teste', role: 'lider' })

    await expect(profileService.get()).resolves.toEqual({
      name: 'Fulano Teste',
      role: 'lider'
    })
    expect(mockApiFetch).toHaveBeenCalledTimes(1)
    expect(mockApiFetch).toHaveBeenCalledWith('/api/profile')
  })

  it('resolves null on 204', async () => {
    mockApiFetch.mockResolvedValue(null)

    await expect(profileService.get()).resolves.toBeNull()
  })

  it('rejects when apiFetch rejects', async () => {
    mockApiFetch.mockRejectedValue(new Error('HTTP 500'))

    await expect(profileService.get()).rejects.toThrow('HTTP 500')
  })
})
