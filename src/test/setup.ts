import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with Testing Library matchers
// Adding safety check to prevent "Cannot convert undefined or null to object" error
if (matchers && typeof matchers === 'object') {
  expect.extend(matchers);
} else {
  console.warn('Test matchers not found or invalid format, skipping extension');
}

// Clean up after each test
afterEach(() => {
  cleanup();
}); 