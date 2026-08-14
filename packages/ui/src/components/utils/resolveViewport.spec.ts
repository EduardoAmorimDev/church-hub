import { APP_MEDIA_QUERY, resolveViewport } from '.'

const mediaQueryList = (query: string, matches: boolean): MediaQueryList => ({
  matches,
  media: query,
  onchange: null,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  dispatchEvent: jest.fn(() => false)
})

const stubMatchMedia = (narrow: boolean) => {
  const matchMedia = jest.fn((query: string) =>
    mediaQueryList(query, narrow && query === APP_MEDIA_QUERY)
  )
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: matchMedia,
    writable: true
  })
  return matchMedia
}

const inside = (viewport?: string) => {
  const host = document.createElement('div')
  if (viewport) host.setAttribute('data-viewport', viewport)
  const element = document.createElement('span')
  host.appendChild(element)
  document.body.appendChild(host)
  return element
}

afterEach(() => {
  document.body.innerHTML = ''
  Reflect.deleteProperty(window, 'matchMedia')
})

describe('resolveViewport', () => {
  it('resolves the viewport (C1)', () => {
    expect(APP_MEDIA_QUERY).toBe('(max-width: 959px)')

    const wide = stubMatchMedia(false)
    expect(resolveViewport(inside('mobile'))).toBe('mobile')
    expect(wide).not.toHaveBeenCalled()

    stubMatchMedia(true)
    expect(resolveViewport(inside('desktop'))).toBe('desktop')

    const narrow = stubMatchMedia(true)
    expect(resolveViewport(inside())).toBe('mobile')
    expect(narrow).toHaveBeenCalledWith('(max-width: 959px)')

    stubMatchMedia(false)
    expect(resolveViewport(inside())).toBe('desktop')
    expect(resolveViewport(null)).toBe('desktop')

    Reflect.deleteProperty(window, 'matchMedia')
    expect(typeof window.matchMedia).toBe('undefined')
    expect(resolveViewport(inside())).toBe('desktop')
  })
})
