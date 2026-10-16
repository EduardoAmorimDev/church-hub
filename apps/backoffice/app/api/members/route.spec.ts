import { NextRequest } from 'next/server'
import { GET, POST } from './route'
import { authorizationOf, json, mockBackend } from '~/test/backend'
import { SESSION_EXPIRED_BODY, signedInStore } from '~/test/routeSession'
import { createCookieStore, type FakeCookieStore } from '~/test/session'
import { fakePersonInput, fakeRawPerson } from '~/test/person'

let mockCookies: FakeCookieStore

jest.mock('next/headers', () => ({
  cookies: async () => mockCookies.store
}))

function makeRequest(search = '', headers: Record<string, string> = {}) {
  return new NextRequest(
    `http://localhost/api/members${search ? `?${search}` : ''}`,
    { headers }
  )
}

function membersResponse(items: unknown[], total: number, page: number) {
  return json({ data: items }, 200, {
    'pagination-total': String(total),
    'pagination-page': String(page)
  })
}

const fakeMember = {
  id: 'fake-id-1',
  nome: 'Membro Fictício',
  email: 'ficticio@example.test',
  telefone: '(00) 00000-0000',
  bairro: 'Bairro Fictício',
  status: 'ativo',
  origemCadastro: 'Importação'
}

beforeEach(async () => {
  mockCookies = await signedInStore()
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('GET /api/members — C17: no session → 401 without the backend', () => {
  it('answers 401 with the session-expired message', async () => {
    mockCookies = createCookieStore()
    const { fetchSpy } = mockBackend({})

    const res = await GET(makeRequest())

    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toEqual(SESSION_EXPIRED_BODY)
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

describe('GET /api/members — C24: browser Authorization is ignored', () => {
  it('answers 401 to a forged bearer without a cookie', async () => {
    mockCookies = createCookieStore()
    const { fetchSpy } = mockBackend({})

    const res = await GET(makeRequest('', { Authorization: 'Bearer forjado' }))

    expect(res.status).toBe(401)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('sends the session token, not the browser header, to the backend', async () => {
    const { callsTo } = mockBackend({
      '/admin/membros': [() => membersResponse([], 0, 1)]
    })

    await GET(makeRequest('', { Authorization: 'Bearer forjado' }))

    expect(authorizationOf(callsTo('/admin/membros')[0][1])).toBe(
      'Bearer access-fake'
    )
  })
})

describe('GET /api/members — C25: returns {data, total, page}', () => {
  it('reads pagination-total and pagination-page from headers and returns combined JSON', async () => {
    mockBackend({
      '/admin/membros': [() => membersResponse([fakeMember], 42, 1)]
    })

    const res = await GET(makeRequest('page=1&limit=10'))
    const body = (await res.json()) as {
      data: unknown[]
      total: number
      page: number
    }

    expect(res.status).toBe(200)
    expect(body.total).toBe(42)
    expect(body.page).toBe(1)
    expect(body.data).toHaveLength(1)
    expect(body.data[0]).toMatchObject({ id: 'fake-id-1' })
  })

  it('forwards status and bairro query params to the backend', async () => {
    const { callsTo } = mockBackend({
      '/admin/membros': [() => membersResponse([], 0, 1)]
    })

    await GET(makeRequest('status=ativo&bairro=Fictício'))

    const url = new URL(String(callsTo('/admin/membros')[0][0]))
    expect(url.searchParams.get('status')).toBe('ativo')
    expect(url.searchParams.get('bairro')).toBe('Fictício')
  })
})

describe('GET /api/members — C26: backend errors relayed as-is', () => {
  it('relays 403 with its body', async () => {
    const body = {
      message: 'Acesso restrito para este perfil',
      statusCode: 403
    }
    mockBackend({ '/admin/membros': [() => json(body, 403)] })

    const res = await GET(makeRequest())

    expect(res.status).toBe(403)
    await expect(res.json()).resolves.toEqual(body)
  })

  it('relays 422 with its body', async () => {
    const body = {
      error: 'FiltroInvalidoException',
      message: 'Filtro inválido.'
    }
    mockBackend({ '/admin/membros': [() => json(body, 422)] })

    const res = await GET(makeRequest('status=x'))

    expect(res.status).toBe(422)
    await expect(res.json()).resolves.toEqual(body)
  })
})

function postRequest(body: unknown) {
  return new Request('http://localhost/api/members', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

describe('POST /api/members — C26: creates through /core/pessoas', () => {
  it('sends dataNascimento as yyyy/MM/dd and answers 201 with the mapped person', async () => {
    const { callsTo } = mockBackend({
      '/core/pessoas': [() => json({ data: fakeRawPerson }, 201)]
    })

    const res = await POST(postRequest(fakePersonInput))
    const sent = JSON.parse(String(callsTo('/core/pessoas')[0][1]?.body))

    expect(callsTo('/core/pessoas')[0][1]?.method).toBe('POST')
    expect(sent.dataNascimento).toBe('1990/01/31')
    expect(sent.genero).toBe('feminino')
    expect(sent.endereco).toEqual(fakePersonInput.endereco)
    expect(authorizationOf(callsTo('/core/pessoas')[0][1])).toBe(
      'Bearer access-fake'
    )
    expect(res.status).toBe(201)
    await expect(res.json()).resolves.toMatchObject({
      data: {
        id: 'fake-id-1',
        nome: 'Pessoa Exemplo',
        dataNascimento: '1990-01-31'
      }
    })
  })

  it('answers 400 without calling the backend when a required field is empty', async () => {
    const { fetchSpy } = mockBackend({})

    const res = await POST(postRequest({ ...fakePersonInput, cpf: '' }))

    expect(res.status).toBe(400)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('relays a backend 500 with its body', async () => {
    const body = {
      error: 'Error',
      message: 'Algo deu errado. Tente novamente em instântes.'
    }
    mockBackend({ '/core/pessoas': [() => json(body, 500)] })

    const res = await POST(postRequest(fakePersonInput))

    expect(res.status).toBe(500)
    await expect(res.json()).resolves.toEqual(body)
  })

  it('answers 401 without a session', async () => {
    mockCookies = createCookieStore()
    const { fetchSpy } = mockBackend({})

    const res = await POST(postRequest(fakePersonInput))

    expect(res.status).toBe(401)
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
