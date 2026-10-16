import { minutesFromNow } from '~/test/session'

type Route = (init: RequestInit | undefined) => Response | Promise<Response>

export function json(body: unknown, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  })
}

export function refreshed(suffix: string) {
  return json({
    data: {
      accessToken: `access-${suffix}`,
      accessTokenExpiraEm: minutesFromNow(15),
      refreshToken: `refresh-${suffix}`
    }
  })
}

function pathOf(input: RequestInfo | URL): string {
  return new URL(input instanceof Request ? input.url : String(input)).pathname
}

/**
 * Stubs `fetch` by backend path. A route answers its calls in order and keeps
 * repeating its last answer; an unrouted path rejects the call.
 */
export function mockBackend(routes: Record<string, Route[]>) {
  const fetchSpy = jest
    .spyOn(global, 'fetch')
    .mockImplementation(async (input, init) => {
      const queue = routes[pathOf(input)]
      const next = queue && (queue.length > 1 ? queue.shift() : queue[0])
      if (!next) throw new Error(`unexpected backend call ${pathOf(input)}`)
      return next(init)
    })

  const callsTo = (path: string) =>
    fetchSpy.mock.calls.filter(([input]) => pathOf(input) === path)

  return { fetchSpy, callsTo }
}

export function authorizationOf(init: RequestInit | undefined): string | null {
  return new Headers(init?.headers).get('Authorization')
}
