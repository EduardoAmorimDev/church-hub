import { TestEnvironment } from 'jest-environment-jsdom'

// why: jsdom 26 doesn't expose Node 18+ Fetch API globals; patch them from Node's own globalThis.
class JSDOMWithFetch extends TestEnvironment {
  async setup() {
    await super.setup()
    const fetchGlobals = ['fetch', 'Request', 'Response', 'Headers', 'FormData']
    for (const name of fetchGlobals) {
      if (!(name in this.global) && name in globalThis) {
        this.global[name] = globalThis[name]
      }
    }
  }
}

export default JSDOMWithFetch
