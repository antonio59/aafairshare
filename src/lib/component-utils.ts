import type { ComponentType } from 'react';

export function createComponentExports(component: ComponentType, componentName: string) {
  return {
    [componentName]: component,
  };
}
