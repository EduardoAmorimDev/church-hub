import type { toast as toastFn } from 'react-toastify'
import type { navigate as navigateFn } from '~/lib/navigate'

jest.mock('react-toastify', () => ({
  ...jest.requireActual('react-toastify'),
  toast: { error: jest.fn() }
}))

// why: full replacement — navigate wraps window.location; not available in jsdom test environment.
jest.mock('~/lib/navigate', () => ({ navigate: jest.fn() }))

const GENERIC = 'Algo deu errado. Tente novamente em instantes.'

type Http = typeof import('./http')

/**
 * Fresh copies of the client and its mocks: the expired-session flag is
 * module state, so each test needs its own module instance.
 */
async function load(): Promise<{
  http: Http
  toast: jest.Mocked<typeof toastFn>
  navigate: jest.MockedFunction<typeof navigateFn>
}> {
  let loaded: Awaited<ReturnType<typeof load>> | undefined
  await jest.isolateModulesAsync(async () => {
    const http = await import('./http')
    const { toast } = await import('react-toastify')
    const { navigate } = await import('~/lib/navigate')
    loaded = {
      http,
      toast: jest.mocked(toast),
      navigate: jest.mocked(navigate)
    }
  })
  if (!loaded) throw new Error('isolateModulesAsync did not run')
  return loaded
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

function respondWith(...responses: Array<Response | Error>) {
  const spy = jest.spyOn(global, 'fetch')
  for (const response of responses) {
    if (response instanceof Error) spy.mockRejectedValueOnce(response)
    else spy.mockResolvedValueOnce(response)
  }
  return spy
}

async function settledWithin<T>(promise: Promise<T>): Promise<boolean> {
  const pending = Symbol('pending')
  const result = await Promise.race([
    promise.then(
      () => 'settled',
      () => 'settled'
    ),
    new Promise(resolve => setTimeout(() => resolve(pending), 20))
  ])
  return result !== pending
}

afterEach(() => {
  jest.restoreAllMocks()
})

describe('apiFetch — C27: no Authorization from the browser', () => {
  it('sends the request without an Authorization header', async () => {
    const { http } = await load()
    const fetchSpy = respondWith(jsonResponse({ data: [] }))

    await http.apiFetch('/api/members')

    const init = fetchSpy.mock.calls[0][1]
    expect(new Headers(init?.headers).has('Authorization')).toBe(false)
  })
})

describe('apiFetch — C29: 401 → /login?session=expired', () => {
  it('navigates once, shows no toast and never settles', async () => {
    const { http, toast, navigate } = await load()
    respondWith(jsonResponse({ message: 'Sua sessão expirou.' }, 401))

    const call = http.apiFetch('/api/members')

    await expect(settledWithin(call)).resolves.toBe(false)
    expect(navigate).toHaveBeenCalledWith('/login?session=expired')
    expect(toast.error).not.toHaveBeenCalled()
  })
})

describe('apiFetch — C31: concurrent 401s', () => {
  it('navigates a single time and toasts nothing', async () => {
    const { http, toast, navigate } = await load()
    respondWith(
      jsonResponse({}, 401),
      jsonResponse({}, 401),
      jsonResponse({}, 401)
    )

    const calls = [
      http.apiFetch('/api/members?limit=1'),
      http.apiFetch('/api/members?limit=1&status=ativo'),
      http.apiFetchRaw('/api/members/export')
    ]

    await expect(settledWithin(Promise.race(calls))).resolves.toBe(false)
    expect(navigate).toHaveBeenCalledTimes(1)
    expect(toast.error).not.toHaveBeenCalled()
  })
})

describe('apiFetch — C32: error statuses toast and reject', () => {
  it.each([
    [403, { statusCode: 403 }, 'Sem permissão para realizar esta ação.'],
    [500, { message: 'detalhe interno' }, GENERIC],
    [503, {}, GENERIC],
    [
      422,
      { error: 'SenhaFraca', message: 'A senha é fraca.' },
      'A senha é fraca.'
    ],
    [400, {}, GENERIC]
  ])('%i → %s', async (status, body, expected) => {
    const { http, toast } = await load()
    respondWith(jsonResponse(body, status))

    await expect(http.apiFetch('/api/members')).rejects.toThrow(
      `HTTP ${status}`
    )
    expect(toast.error).toHaveBeenCalledWith(expected, { toastId: expected })
  })

  it('network failure → generic toast and rejection', async () => {
    const { http, toast } = await load()
    respondWith(new TypeError('Failed to fetch'))

    await expect(http.apiFetch('/api/members')).rejects.toThrow(
      'Failed to fetch'
    )
    expect(toast.error).toHaveBeenCalledWith(GENERIC, { toastId: GENERIC })
  })

  it('apiFetchRaw applies the same handling to a non-JSON error body', async () => {
    const { http, toast } = await load()
    respondWith(new Response('Internal Server Error', { status: 500 }))

    await expect(http.apiFetchRaw('/api/members/export')).rejects.toThrow(
      'HTTP 500'
    )
    expect(toast.error).toHaveBeenCalledWith(GENERIC, { toastId: GENERIC })
  })
})

describe('apiFetch — C33: 204 → null', () => {
  it('resolves with null and shows no toast', async () => {
    const { http, toast } = await load()
    respondWith(new Response(null, { status: 204 }))

    await expect(http.apiFetch('/api/members/x')).resolves.toBeNull()
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('resolves {} for a success without data', async () => {
    const { http, toast } = await load()
    respondWith(jsonResponse({}))

    await expect(http.apiFetch('/api/members')).resolves.toEqual({})
    expect(toast.error).not.toHaveBeenCalled()
  })
})

describe('apiFetch — C34: identical failures share one toast id', () => {
  it('uses the message as toastId for concurrent 500s', async () => {
    const { http, toast } = await load()
    respondWith(jsonResponse({}, 500), jsonResponse({}, 500))

    await Promise.allSettled([
      http.apiFetch('/api/members?limit=1'),
      http.apiFetch('/api/members?limit=1&status=ativo')
    ])

    expect(toast.error).toHaveBeenCalledTimes(2)
    for (const [, options] of toast.error.mock.calls) {
      expect(options).toEqual({ toastId: GENERIC })
    }
  })
})

describe('apiFetch — C9: a 401 goes to /login?session=expired', () => {
  it('C9 navigates to the en-US query', async () => {
    const { http, navigate } = await load()
    respondWith(jsonResponse({ message: 'Sua sessão expirou.' }, 401))

    await settledWithin(http.apiFetch('/api/members'))

    expect(navigate).toHaveBeenCalledWith('/login?session=expired')
  })
})
