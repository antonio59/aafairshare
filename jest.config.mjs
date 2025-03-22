/** @type {import('jest').Config} */

const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/e2e/',
    '<rootDir>/playwright/',
    '\.spec\.ts$',
    'hydration-performance\.test\.tsx$',
  ],
  // Set environment variables for tests
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@testing-library|domexception|abab|@radix-ui|class-variance-authority|clsx|tailwind-merge)/)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/types/**/*'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default config;
