import { GET, PATCH } from './route'
import { authorizationOf, json, mockBackend } from '~/test/backend'
import { fakePersonInput, fakeRawPerson } from '~/test/person'
import { SESSION_EXPIRED_BODY, signedInStore } from '~/test/routeSession'
import { createCookieStore, type FakeCookieStore } from '~/test/session'

let mockCookies: FakeCookieStore

jest.mock('next/headers', () => ({
  cookies: async () => mockCookies.store
}))

const PATH = '/core/pessoas/fake-id-1'

function params(id: string) {
  return { params: Promise.resolve({ id }) }
}

function patchRequest(body: unknown) {
  return new Request('http://localhost/api/members/fake-id-1', {
    method: 'PATCH',
    body: JSON.stringify(body)
  })
}

const getRequest = () => new Request('http://localhost/api/members/fake-id-1')

beforeEach(async () => {
  mockCookies = await signedInStore()
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('GET /api/members/[id] — C27: reads /core/pessoas/:id without the `_` shape', () => {
  it('maps the raw entity, dates as yyyy-MM-dd', async () => {
    const { callsTo } = mockBackend({
      [PATH]: [() => json({ data: fakeRawPerson })]
    })

    const res = await GET(getRequest(), params('fake-id-1'))

    expect(authorizationOf(callsTo(PATH)[0][1])).toBe('Bearer access-fake')
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      data: {
        id: 'fake-id-1',
        nome: 'Pessoa Exemplo',
        cpf: '000.000.000-00',
        dataNascimento: '1990-01-31',
        genero: 'feminino',
        email: 'pessoa@example.test',
        telefone: '11900000000',
        endereco: fakePersonInput.endereco,
        profissao: '',
        escolaridade: '',
        estadoCivil: '',
        status: 'ativo'
      }
    })
  })

  it('C27 a missing person (204) answers 204', async () => {
    mockBackend({ [PATH]: [() => new Response(null, { status: 204 })] })

    const res = await GET(getRequest(), params('fake-id-1'))

    expect(res.status).toBe(204)
  })

  it('a null date and an absent address map to null', async () => {
    mockBackend({
      [PATH]: [
        () =>
          json({
            data: {
              ...fakeRawPerson,
              _dataNascimento: { _valor: null },
              _endereco: undefined
            }
          })
      ]
    })

    const res = await GET(getRequest(), params('fake-id-1'))

    await expect(res.json()).resolves.toMatchObject({
      data: { dataNascimento: null, endereco: null }
    })
  })

  it('a body that is not a person answers 502', async () => {
    mockBackend({ [PATH]: [() => json({ data: { nome: 'sem id' } })] })

    const res = await GET(getRequest(), params('fake-id-1'))

    expect(res.status).toBe(502)
  })

  it('answers 401 without a session', async () => {
    mockCookies = createCookieStore()
    const { fetchSpy } = mockBackend({})

    const res = await GET(getRequest(), params('fake-id-1'))

    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toEqual(SESSION_EXPIRED_BODY)
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

describe('PATCH /api/members/[id] — C28: updates with genero and the whole endereco', () => {
  it('sends genero, endereco and dataNascimento yyyy/MM/dd', async () => {
    const { callsTo } = mockBackend({
      [PATH]: [() => json({ data: fakeRawPerson })]
    })

    const res = await PATCH(patchRequest(fakePersonInput), params('fake-id-1'))
    const sent = JSON.parse(String(callsTo(PATH)[0][1]?.body))

    expect(callsTo(PATH)[0][1]?.method).toBe('PATCH')
    expect(sent.genero).toBe('feminino')
    expect(sent.endereco).toEqual(fakePersonInput.endereco)
    expect(sent.dataNascimento).toBe('1990/01/31')
    expect(res.status).toBe(200)
  })

  it('answers 400 without calling the backend when genero is missing', async () => {
    const { fetchSpy } = mockBackend({})

    const res = await PATCH(
      patchRequest({ ...fakePersonInput, genero: null }),
      params('fake-id-1')
    )

    expect(res.status).toBe(400)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('a missing person (204) answers 204', async () => {
    mockBackend({ [PATH]: [() => new Response(null, { status: 204 })] })

    const res = await PATCH(patchRequest(fakePersonInput), params('fake-id-1'))

    expect(res.status).toBe(204)
  })
})
