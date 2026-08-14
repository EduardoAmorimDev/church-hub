import type { Linter } from 'eslint'

declare module '@repo/eslint-config/next-js' {
  export const nextJsConfig: Linter.Config[]
}
