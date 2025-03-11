# Testing Setup Guide

This guide provides step-by-step instructions for setting up the testing infrastructure for our application.

## Table of Contents

1. [Setting Up Unit and Integration Tests](#setting-up-unit-and-integration-tests)
2. [Setting Up Component Tests](#setting-up-component-tests)
3. [Setting Up End-to-End Tests](#setting-up-end-to-end-tests)
4. [Performance Testing](#performance-testing)
5. [Accessibility Testing](#accessibility-testing)
6. [CI/CD Integration](#cicd-integration)

## Setting Up Unit and Integration Tests

### 1. Install Dependencies

```bash
npm install --save-dev vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom happy-dom @vitest/coverage-v8 vitest-preview
```

### 2. Configure Vitest

Create a `vitest.config.ts` file in the project root:

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['./src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.config.{ts,js}',
        '**/mock/**',
        'src/test/**'
      ]
    }
  }
});
```

### 3. Create Test Setup

Create the file `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with Testing Library matchers
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  cleanup();
});
```

### 4. Set Up Supabase Test Mocks

Create a file `src/test/mocks/supabase.ts`:

```typescript
import { SupabaseClient } from '@supabase/supabase-js';

// Mock Supabase client for testing
export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn()
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation((callback) => callback({
      data: null,
      error: null
    }))
  }),
  storage: {
    listBuckets: vi.fn(),
    getBucket: vi.fn(),
    createBucket: vi.fn(),
    deleteBucket: vi.fn(),
    from: vi.fn().mockReturnValue({
      upload: vi.fn(),
      download: vi.fn(),
      getPublicUrl: vi.fn(),
      list: vi.fn(),
      remove: vi.fn()
    })
  }
} as unknown as SupabaseClient;

// Create a mock provider for wrapping components
export const createTestSupabaseContext = () => {
  // Implement based on your actual Supabase context implementation
};
```

### 5. Add Scripts to package.json

Add these scripts to your `package.json`:

```json
"scripts": {
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:run": "vitest run",
  "test:coverage": "vitest run --coverage"
}
```

## Setting Up Component Tests

### 1. Install Storybook

```bash
npx storybook@latest init
```

### 2. Configure Storybook for Testing

Create a file `.storybook/test-runner.js`:

```javascript
const { injectAxe, checkA11y } = require('axe-playwright');

module.exports = {
  async preRender(page) {
    await injectAxe(page);
  },
  async postRender(page) {
    await checkA11y(page, {
      detailedReport: true,
      detailedReportOptions: {
        html: true
      }
    });
  }
};
```

### 3. Install Storybook Test Runner

```bash
npm install --save-dev @storybook/test-runner
```

### 4. Add Test Script

Add this script to your `package.json`:

```json
"scripts": {
  "test-storybook": "test-storybook"
}
```

## Setting Up End-to-End Tests

### 1. Install Playwright

```bash
npm init playwright@latest
```

### 2. Configure Playwright

Modify the generated `playwright.config.ts` to include:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe'
  }
});
```

### 3. Create Test Examples

Create an example test in `e2e/settlement-flow.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Settlement Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and log in
    await page.goto('/');
    // Implement login logic here
  });

  test('should create a new settlement', async ({ page }) => {
    // Example test for creating a settlement
    await page.click('button:has-text("Create Settlement")');
    await page.fill('[data-testid="settlement-name"]', 'Test Settlement');
    await page.click('[data-testid="submit-settlement"]');
    
    // Verification
    await expect(page.locator('text=Settlement created successfully')).toBeVisible();
  });
});
```

## Performance Testing

### 1. Install Lighthouse CI

```bash
npm install --save-dev @lhci/cli
```

### 2. Configure Lighthouse CI

Create a `lighthouserc.js` file:

```javascript
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview',
      url: ['http://localhost:4173/'],
      numberOfRuns: 3
    },
    upload: {
      target: 'temporary-public-storage'
    },
    assert: {
      preset: 'lighthouse:recommended'
    }
  }
};
```

### 3. Add Script to package.json

```json
"scripts": {
  "test:performance": "lhci autorun"
}
```

## Accessibility Testing

### 1. Install Axe Core

```bash
npm install --save-dev axe-core
```

### 2. Integrate with Playwright E2E Tests

Add this to your Playwright test setup:

```typescript
import { test as base } from '@playwright/test';
import * as axeCore from 'axe-core';

type AxeFixture = {
  runAxe: (selector?: string) => Promise<axeCore.AxeResults>;
};

export const test = base.extend<AxeFixture>({
  runAxe: async ({ page }, use) => {
    await use(async (selector = 'body') => {
      return await page.evaluate(
        ([selector]) => {
          // @ts-ignore
          return window.axe.run(selector);
        },
        [selector]
      );
    });
  },
  page: async ({ page }, use) => {
    await page.addInitScript({
      path: require.resolve('axe-core/axe.min.js')
    });
    await use(page);
  }
});

export { expect } from '@playwright/test';
```

## CI/CD Integration

### 1. GitHub Actions Setup

Create a file `.github/workflows/test.yml`:

```yaml
name: Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit and integration tests
        run: npm run test:coverage
        
      - name: Run Storybook tests
        run: npm run test-storybook -- --ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        
      - name: Run E2E tests
        run: npx playwright test
        
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        if: always()
        
      - name: Run Lighthouse CI
        run: npm run test:performance
        if: success() 