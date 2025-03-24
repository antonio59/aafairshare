# Component Library

The AAFairShare project includes a component library to maintain UI consistency throughout the application.

## Component Organization

Components are organized into feature-specific directories:

```
src/components/
├── auth/        # Authentication components
├── categories/  # Category management components
├── dashboard/   # Dashboard components
├── expenses/    # Expense management components
├── layout/      # Layout components
├── locations/   # Location management components
├── settlements/ # Settlement components
└── ui/          # UI primitives
```

## UI Components

The `ui/` directory contains reusable UI primitives based on a custom design system:

- **Layout components**: Card, Dialog, Sheet, Tabs
- **Form components**: Button, Checkbox, Input, Label, RadioGroup, Select, Switch
- **Feedback components**: Skeleton, Toast, Error boundary
- **Other UI components**: Badge, Avatar, Tooltip

## Usage with Barrel Files

Components can be imported using barrel files for cleaner imports:

```tsx
// Before
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// After
import { Button, Card, Input } from '@/components/ui';
```

## Component Library Page

The project includes an interactive component library page at `/storybook` to:

- Browse available components
- View components in different states
- Copy component code
- Check component usage guidance

## Design Principles

1. **Consistency**: Components use consistent props, naming, and styling
2. **Accessibility**: All components are built with accessibility in mind
3. **Composability**: Components can be combined in different ways
4. **Responsive**: Components work across different devices and screen sizes

## Contributing New Components

When adding new components:

1. Place them in the appropriate directory
2. Include proper TypeScript types for all props
3. Update the barrel file (`index.ts`) for the directory
4. Add the component to the storybook page if it's a UI component

## Component Documentation Standards

Each component should have:

- Proper JSDoc comments explaining its purpose
- Props interface with descriptions
- Usage examples
- Accessibility notes

Example:

```tsx
/**
 * Button component for triggering actions.
 * 
 * @example
 * <Button variant="primary">Click me</Button>
 */
export interface ButtonProps {
  /** The button's visual style */
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  /** The size of the button */
  size?: 'default' | 'sm' | 'lg';
  /** Disables the button when true */
  disabled?: boolean;
  /** Called when the button is clicked */
  onClick?: () => void;
  /** The button's content */
  children: React.ReactNode;
}
```
