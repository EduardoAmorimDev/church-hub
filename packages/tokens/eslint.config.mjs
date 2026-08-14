import { nextJsConfig } from '@repo/eslint-config/next-js'
import { defineConfig } from 'eslint/config'

/** @type {import("eslint").Linter.Config} */
export default defineConfig(nextJsConfig, {
  // why: build scripts report to a terminal, not a browser (constitution XIV).
  files: ['src/scripts/**'],
  rules: { 'no-console': 'off' }
})
