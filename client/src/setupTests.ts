// Import Jest DOM matchers like expect(...).toBeInTheDocument()
import '@testing-library/jest-dom/vitest';

// Optional: Add any other global setup needed for your tests
// For example, mocking global objects or setting up mocks

// Vitest automatically handles cleanup for React Testing Library
// when `globals: true` is set in the config, so explicit
// afterEach(cleanup) is usually not required.
