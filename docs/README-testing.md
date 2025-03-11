# Testing Documentation

## Overview

This repository contains a comprehensive testing setup for ensuring the quality and reliability of our application. We use a multi-layered testing approach that includes unit tests, integration tests, component tests, end-to-end tests, performance testing, and accessibility testing.

## Testing Structure

```
├── src/
│   ├── test/
│   │   ├── setup.ts               # Global test setup for unit/integration tests
│   │   ├── mocks/                 # Mock implementations for testing
│   │   │   ├── supabase.ts        # Supabase client mocks
│   │   │   └── ...
│   │   └── examples/              # Example test implementations
│   │       ├── settlement.test.tsx     # Unit tests for settlement feature
│   │       ├── ui-components.test.tsx  # Snapshot tests for UI components
│   │       └── ...
├── e2e/
│   ├── fixtures/                  # Test fixtures for E2E tests
│   │   └── receipt.jpg            # Example receipt image for testing
│   ├── examples/                  # Example E2E tests
│   │   ├── expense-flow.spec.ts   # E2E tests for expense flow
│   │   └── ...  
│   └── utils/                     # Helper utilities for E2E tests
│       └── ...
└── playwright.config.ts          # Playwright configuration
```

## Running Tests

### Unit and Integration Tests

```bash
# Run all tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage
```

### Component Tests with Storybook

```bash
# Start Storybook for component development
npm run storybook

# Run Storybook tests
npm run test-storybook
```

### End-to-End Tests

```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test e2e/examples/expense-flow.spec.ts

# Run tests in UI mode
npx playwright test --ui

# Run tests in a specific browser
npx playwright test --project=chromium
```

### Performance Tests

```bash
# Run Lighthouse CI
npm run test:performance
```

## Test Coverage

We aim for the following test coverage targets:

- Core Business Logic: 90%+
- UI Components: 70%+
- Utility Functions: 80%+
- API Services: 85%+

You can view the latest coverage report by running:

```bash
npm run test:coverage
```

## Testing Best Practices

### Unit Tests

- Test one piece of functionality at a time
- Mock external dependencies
- Follow the AAA pattern (Arrange, Act, Assert)
- Use descriptive test names that explain what is being tested

### Integration Tests

- Focus on interactions between components or services
- Test workflows that involve multiple units
- Use realistic test data

### Component Tests

- Test UI components in isolation
- Verify both appearance and behavior
- Use snapshots for detecting unintended UI changes

### End-to-End Tests

- Focus on critical user journeys
- Test complete workflows from end to end
- Use realistic data and environment settings

## Continuous Integration

Our tests are automatically run as part of our CI/CD pipeline:

- Unit and integration tests run on every commit
- E2E tests run for pull requests to main branches
- Performance tests run as part of the build process
- Coverage reports are generated and uploaded to the CI system

## Adding New Tests

When adding new features, follow these guidelines:

1. **Unit Tests**: Add tests for new functions, hooks, and utilities
2. **Integration Tests**: Add tests for new API interactions and component interactions
3. **Snapshot Tests**: Add for new UI components
4. **E2E Tests**: Add for new critical user journeys

## Documentation

For more detailed information about our testing strategy and setup, refer to:

- [Testing Strategy Documentation](./testing-strategy.md)
- [Testing Setup Guide](./testing-setup-guide.md) 