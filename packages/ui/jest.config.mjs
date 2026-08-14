/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'typescript', tsx: true },
          transform: { react: { runtime: 'automatic' } }
        },
        module: { type: 'commonjs' }
      }
    ]
  },
  // why: `@dnd-kit`, `@tanstack` and `@preact/signals-core` ship ESM only,
  // which Jest cannot load untransformed.
  transformIgnorePatterns: [
    '/node_modules/(?!(@dnd-kit|@tanstack|@preact/signals-core)/)'
  ],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/test/styleStub.js',
    // hazard: the repo root hoists react 18 (from apps/native); without these
    // a hoisted dependency loads a second React and rendering breaks.
    '^react$': '<rootDir>/node_modules/react',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
    '^react-dom/(.*)$': '<rootDir>/node_modules/react-dom/$1',
    '^react/jsx-runtime$': '<rootDir>/node_modules/react/jsx-runtime',
    '^react/jsx-dev-runtime$': '<rootDir>/node_modules/react/jsx-dev-runtime'
  }
}

export default config
