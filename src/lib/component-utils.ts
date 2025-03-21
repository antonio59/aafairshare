/**
 * Component Export Utilities
 * 
 * This file provides utilities for standardizing component exports
 * following the TypeScript-first approach with React 19 compatibility.
 */

import type { ComponentType } from 'react';

/**
 * Creates standardized exports for UI components
 * 
 * @param component The React component to export
 * @param displayName The display name for the component
 * @returns An object with PascalCase and lowercase exports
 */
export function createComponentExports<T>(
  component: ComponentType<T>,
  displayName: string
): {
  PascalCase: ComponentType<T>;
  lowercase: ComponentType<T>;
} {
  // Set display name for better debugging
  component.displayName = displayName;
  
  // Return both export formats using the same implementation
  return {
    PascalCase: component,
    lowercase: component
  };
}
