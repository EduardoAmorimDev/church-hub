import { defineConfig, Options } from 'tsup'

export default defineConfig((options: Options) => ({
  entry: {
    index: 'src/index.ts'
  },
  banner: {
    js: "'use client'"
  },
  clean: false,
  format: ['cjs', 'esm'],
  external: ['react'],
  dts: true,
  ...options
}))
