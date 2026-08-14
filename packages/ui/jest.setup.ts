import '@testing-library/jest-dom'

// jsdom implements no layout, so these browser observers do not exist there.
// `@dnd-kit/dom` constructs them at import time, which would abort any suite
// that merely imports a component using drag and drop. These stubs let the
// module load; they deliberately report nothing, because drag behaviour that
// depends on real geometry is verified in Storybook, not here (research.md R6).
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
