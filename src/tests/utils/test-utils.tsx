import React from 'react';
import { render as rtlRender, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Override the act warning by setting the environment variable
process.env.REACT_DOM_ACT_WARNINGS = 'false';

// Re-export everything from testing-library
export { screen, waitFor, fireEvent, userEvent };

// Override render method
export function render(ui: React.ReactElement, options = {}) {
  return rtlRender(ui, options);
}
