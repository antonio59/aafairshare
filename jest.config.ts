import type { Config } from '@jest/types';

const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    // Following our TypeScript path alias structure
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '\\.css$': 'identity-obj-proxy'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/e2e/',
    '/playwright/',
    '\\.spec\\.ts$' // Exclude Playwright test files
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: './tsconfig.json'
    }]
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@testing-library|domexception|abab|@radix-ui|class-variance-authority|clsx|tailwind-merge)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json']
} as Config.InitialOptions;

export default config;
