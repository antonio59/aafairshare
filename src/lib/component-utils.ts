/**
 * Component Utilities
 * 
 * This file provides utilities for working with React components
 * following the TypeScript-first approach with React 19 compatibility.
 */

import type { ComponentType } from 'react';

/**
 * Sets the display name for a component
 * 
 * @param component The React component to name
 * @param displayName The display name for the component
 * @returns The component with display name set
 */
export function setDisplayName<T>(
  component: ComponentType<T>,
  displayName: string
): ComponentType<T> {
  component.displayName = displayName;
  return component;
}
