# UI Components

This directory contains reusable UI components built with Radix UI primitives and styled with Tailwind CSS. These components follow the Shadcn UI design system and are built with accessibility and type safety in mind.

## Component Organization

Components are organized by their functionality and complexity:

### Form Elements
- `button.tsx` - Button component with variants
- `input.tsx` - Text input component
- `textarea.tsx` - Multi-line text input
- `checkbox.tsx` - Checkbox input
- `radio-group.tsx` - Radio button group
- `select.tsx` - Dropdown select
- `switch.tsx` - Toggle switch
- `form.tsx` - Form wrapper with validation

### Layout Components
- `card.tsx` - Card container with header, content, and footer
- `dialog.tsx` - Modal dialog
- `scroll-area.tsx` - Custom scrollable area
- `tabs.tsx` - Tabbed interface

### Feedback Components
- `toast.tsx` - Toast notifications (includes useToast hook)
- `skeleton.tsx` - Loading placeholder
- `badge.tsx` - Status indicator

### Interactive Components
- `dropdown-menu.tsx` - Dropdown menu
- `tooltip.tsx` - Hover tooltip
- `calendar.tsx` - Date picker

## Usage Guidelines

1. All components are built as React Server Components by default
2. Add 'use client' directive only when necessary (e.g., for interactive components)
3. Use TypeScript interfaces for props
4. Follow the naming convention:
   - PascalCase for component names (e.g., `Button`, `Card`)
   - camelCase for props and functions
   - kebab-case for file names

## Export Naming Convention

You may notice that most components have two exports:
- PascalCase (e.g., `export const Button = ...`): This is the primary export that should be used in your components.
- lowercase (e.g., `export const button = ...`): This secondary export is for compatibility with certain tooling and GitHub workflow validation. **Do not use these lowercase exports in your components.**

Example of correct imports:
```tsx
// ✅ Correct
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

// ❌ Incorrect
import { button } from '@/components/ui/button';
import { card } from '@/components/ui/card';
```

## Example Usage

```tsx
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'

export function LoginForm() {
  const { toast } = useToast()

  return (
    <form onSubmit={() => toast({ title: "Success" })}>
      <Input placeholder="Email" />
      <Button type="submit">Login</Button>
    </form>
  )
}
```

## Component Dependencies

- Radix UI primitives
- Tailwind CSS
- class-variance-authority (for variants)
- clsx/tailwind-merge (for class merging)

## Best Practices

1. Use the `cn()` utility for class name merging
2. Implement proper keyboard navigation
3. Include ARIA labels and roles
4. Support dark mode with CSS variables
5. Make components responsive by default
6. Add loading states where appropriate
7. Include proper TypeScript types
8. Document complex components with JSDoc comments 