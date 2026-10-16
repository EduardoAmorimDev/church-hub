import '@testing-library/jest-dom'

// why: synthetic secret so iron-session can seal test cookies; never a real one.
process.env.SESSION_SECRET ??= 'test-only-session-secret-not-real-0000'

// why: @dnd-kit/dom constructs ResizeObserver at import time; same stub as packages/ui.
class NoopObserver {
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}

if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = NoopObserver as unknown as typeof ResizeObserver
}

if (!('IntersectionObserver' in globalThis)) {
  globalThis.IntersectionObserver =
    NoopObserver as unknown as typeof IntersectionObserver
}
