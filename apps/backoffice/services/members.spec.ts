import { membersService } from './members'

// why: full replacement — the service is checked against the HTTP layer's contract, not real HTTP.
jest.mock('~/lib/http', () => ({
  apiFetch: jest.fn(),
  apiFetchRaw: jest.fn()
}))

import { apiFetch, apiFetchRaw } from '~/lib/http'
import { fakePersonInput } from '~/test/person'
import type { PersonDetail } from '~/types/members'

const mockApiFetch = jest.mocked(apiFetch)
const mockApiFetchRaw = jest.mocked(apiFetchRaw)

const fakePerson: PersonDetail = {
  ...fakePersonInput,
  id: 'id-fake-001',
  status: 'ativo'
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('membersService — C36', () => {
  it('list builds limit, page and status into /api/members', async () => {
    mockApiFetch.mockResolvedValue({ data: [], total: 0, page: 2 })

    await membersService.list({ page: 2, limit: 10, status: 'inativo' })

    expect(mockApiFetch).toHaveBeenCalledWith(
      '/api/members?limit=10&page=2&status=inativo'
    )
  })

  it('list omits page and status when absent', async () => {
    mockApiFetch.mockResolvedValue({ data: [], total: 0, page: 1 })

    await membersService.list({ limit: 1, status: null })

    expect(mockApiFetch).toHaveBeenCalledWith('/api/members?limit=1')
  })

  it('get unwraps { data } into the person', async () => {
    mockApiFetch.mockResolvedValue({ data: fakePerson })

    await expect(membersService.get('id-fake-001')).resolves.toEqual(fakePerson)
    expect(mockApiFetch).toHaveBeenCalledWith('/api/members/id-fake-001')
  })

  it('get resolves null on 204', async () => {
    mockApiFetch.mockResolvedValue(null)

    await expect(membersService.get('id-inexistente')).resolves.toBeNull()
  })

  it('export resolves the CSV text', async () => {
    mockApiFetchRaw.mockResolvedValue(new Response('nome,email\nA,b'))

    await expect(membersService.export()).resolves.toBe('nome,email\nA,b')
    expect(mockApiFetchRaw).toHaveBeenCalledWith('/api/members/export')
  })

  it('propagates a rejection from the HTTP layer', async () => {
    mockApiFetch.mockRejectedValue(new Error('HTTP 500'))

    await expect(membersService.list({ limit: 1 })).rejects.toThrow('HTTP 500')
  })

  it('C26 create posts the form input as JSON to /api/members', async () => {
    mockApiFetch.mockResolvedValue({ data: fakePerson })

    await expect(membersService.create(fakePersonInput)).resolves.toEqual(
      fakePerson
    )
    expect(mockApiFetch).toHaveBeenCalledWith('/api/members', {
      method: 'POST',
      body: JSON.stringify(fakePersonInput)
    })
  })

  it('C28 update patches /api/members/:id', async () => {
    mockApiFetch.mockResolvedValue({ data: fakePerson })

    await membersService.update('id-fake-001', fakePersonInput)

    expect(mockApiFetch).toHaveBeenCalledWith('/api/members/id-fake-001', {
      method: 'PATCH',
      body: JSON.stringify(fakePersonInput)
    })
  })

  it('update resolves null on 204', async () => {
    mockApiFetch.mockResolvedValue(null)

    await expect(
      membersService.update('id-fake-001', fakePersonInput)
    ).resolves.toBeNull()
  })

  it('C21 deactivate posts to /api/members/:id/deactivate; false on 204', async () => {
    mockApiFetch.mockResolvedValueOnce({ data: { idPessoa: 'id-fake-001' } })
    await expect(membersService.deactivate('id-fake-001')).resolves.toBe(true)
    expect(mockApiFetch).toHaveBeenCalledWith(
      '/api/members/id-fake-001/deactivate',
      { method: 'POST' }
    )

    mockApiFetch.mockResolvedValueOnce(null)
    await expect(membersService.deactivate('id-fake-001')).resolves.toBe(false)
  })
})
