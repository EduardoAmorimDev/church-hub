const swcTransform = [
  '@swc/jest',
  {
    jsc: {
      parser: { syntax: 'typescript', tsx: true },
      transform: { react: { runtime: 'automatic' } }
    },
    module: { type: 'commonjs' }
  }
]

const sharedModuleNameMapper = {
  '\\.css$': '<rootDir>/test/styleStub.js',
  // why: server-only throws outside the react-server condition, which jest never sets.
  '^server-only$': '<rootDir>/test/styleStub.js',
  '^~/(.*)$': '<rootDir>/$1',
  // why: root hoists react 18 (from apps/app); without these a second React loads and breaks rendering.
  '^react$': '<rootDir>/node_modules/react',
  '^react-dom$': '<rootDir>/node_modules/react-dom',
  '^react-dom/(.*)$': '<rootDir>/node_modules/react-dom/$1',
  '^react/jsx-runtime$': '<rootDir>/node_modules/react/jsx-runtime',
  '^react/jsx-dev-runtime$': '<rootDir>/node_modules/react/jsx-dev-runtime'
}

// why: iron-session and its dependencies ship ESM only.
const transformIgnorePatterns = [
  '/node_modules/(?!(@dnd-kit|@tanstack|@preact/signals-core|iron-session|iron-webcrypto|uint8array-extras|cookie)/)'
]

const serverSpecs = [
  '<rootDir>/app/api/**/*.spec.ts',
  '<rootDir>/app/actions/**/*.spec.ts',
  '<rootDir>/lib/server/**/*.spec.ts',
  '<rootDir>/proxy.spec.ts'
]

/** @type {import('jest').Config} */
const config = {
  projects: [
    {
      displayName: 'server',
      testEnvironment: 'node',
      testMatch: serverSpecs,
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      transform: { '^.+\\.(t|j)sx?$': swcTransform },
      transformIgnorePatterns,
      moduleNameMapper: sharedModuleNameMapper
    },
    {
      displayName: 'client',
      testEnvironment: '<rootDir>/test/jsdom-fetch-env.mjs',
      testMatch: [
        '<rootDir>/lib/**/*.spec.{ts,tsx}',
        '<rootDir>/services/**/*.spec.ts',
        '<rootDir>/app/**/*.spec.tsx'
      ],
      testPathIgnorePatterns: ['/node_modules/', '<rootDir>/lib/server/'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      transform: { '^.+\\.(t|j)sx?$': swcTransform },
      transformIgnorePatterns,
      moduleNameMapper: sharedModuleNameMapper
    }
  ]
}

export default config
