# React 19 & Tailwind CSS 4 Migration Guide

> Last updated: March 20, 2025

This document provides step-by-step guidance for migrating existing components and features to be compatible with React 19 and Tailwind CSS 4. Follow these guidelines to ensure a smooth transition.

## Table of Contents

1. [Migration Checklist](#migration-checklist)
2. [React 19 Migration Steps](#react-19-migration-steps)
3. [Tailwind CSS 4 Migration Steps](#tailwind-css-4-migration-steps)
4. [Testing Migration](#testing-migration)
5. [Troubleshooting](#troubleshooting)

## Migration Checklist

### Pre-Migration
- [ ] Ensure all tests pass with the current version
- [ ] Create a feature branch for the migration
- [ ] Back up your package.json and lock files

### Core Updates
- [ ] Update React, React DOM, and related packages
- [ ] Update Tailwind CSS and related packages
- [ ] Update TypeScript to the compatible version
- [ ] Update testing libraries

### Component Migration
- [ ] Update server/client component boundaries
- [ ] Add effect cleanup functions
- [ ] Refactor class components (if any)
- [ ] Update testing approach

### Final Steps
- [ ] Run full test suite
- [ ] Check performance metrics
- [ ] Prepare for deployment

## React 19 Migration Steps

### 1. Update Dependencies

```bash
npm install react@19.0.0 react-dom@19.0.0 @types/react@19.0.x @types/react-dom@19.0.x
npm install @testing-library/react@15.0.0 @testing-library/jest-dom@latest
```

### 2. Server Component Boundaries

React 19 enforces stricter server/client component boundaries. Here's how to update your components:

#### Client Components

All client components must:
1. Include the `'use client'` directive at the top of the file
2. Be properly isolated in their own files
3. Be dynamically imported in server components when possible

```tsx
// Before: components/ExpenseForm.tsx
import React, { useState } from 'react';

export function ExpenseForm() {
  const [amount, setAmount] = useState(0);
  // Component code
}

// After: components/client/ExpenseForm.tsx
'use client';

import React, { useState } from 'react';

export default function ExpenseForm() {
  const [amount, setAmount] = useState(0);
  // Component code
}

// Usage in a server component
import dynamic from 'next/dynamic';

const ExpenseForm = dynamic(() => import('@/components/client/ExpenseForm'));

export default function Page() {
  return (
    <div>
      <ExpenseForm />
    </div>
  );
}
```

### 3. Effect Cleanup Implementation

React 19 requires explicit cleanup functions for all effects that create subscriptions, timers, or event listeners:

```tsx
// Before
useEffect(() => {
  document.addEventListener('click', handleClick);
  const timer = setInterval(checkData, 1000);
}, []);

// After
useEffect(() => {
  document.addEventListener('click', handleClick);
  const timer = setInterval(checkData, 1000);
  
  return () => {
    document.removeEventListener('click', handleClick);
    clearInterval(timer);
  };
}, []);
```

### 4. Automated Batching

React 19 automatically batches all state updates, regardless of their source. This might require adjusting some component logic:

```tsx
// Before: This might have caused two renders in React 18
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
}

// After: This is automatically batched in React 19, no changes needed
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
}
```

### 5. Function Component Types

React 19 discourages using the `React.FC` type. Update your component type annotations:

```tsx
// Before
const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return <button {...props}>{children}</button>;
};

// After
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  // other props...
}

function Button({ children, ...props }: ButtonProps) {
  return <button {...props}>{children}</button>;
}
```

### 6. Concurrent Features

React 19 improves concurrent mode features. Update your components to take advantage of these:

```tsx
// Before (non-optimized)
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  // fetch logic...
  
  return (
    <div>
      {results.map(item => (
        <ResultItem key={item.id} item={item} />
      ))}
    </div>
  );
}

// After (with concurrent features)
import { Suspense } from 'react';

function SearchResults({ query }) {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <Results query={query} />
    </Suspense>
  );
}

function Results({ query }) {
  const results = use(fetchResults(query));
  
  return (
    <div>
      {results.map(item => (
        <ResultItem key={item.id} item={item} />
      ))}
    </div>
  );
}
```

## Tailwind CSS 4 Migration Steps

### 1. Update Dependencies

```bash
npm install tailwindcss@4.0.0 postcss@latest autoprefixer@latest
npm install @tailwindcss/typography@latest
```

### 2. Update Configuration

Update your `tailwind.config.ts` file:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  // JIT mode is now the default and only option
  darkMode: ['class'], // Updated syntax for dark mode
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
  ],
  theme: {
    // Theme configuration
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
};

export default config;
```

### 3. Update PostCSS Configuration

```javascript
// postcss.config.mjs
export default {
  plugins: {
    'tailwindcss/nesting': {}, // Updated nesting plugin syntax
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}),
  },
};
```

### 4. Update Utility Classes

Several utility classes have been renamed or updated in Tailwind CSS 4:

| Tailwind 3 | Tailwind 4 | Notes |
|------------|------------|-------|
| `grid-cols-{n}` | `grid-cols-{n}` | No change |
| `border-opacity-{n}` | `border-opacity-[0.{n}]` | New format for opacity values |
| `shadow-md` | `shadow-medium` | Some shadow utilities renamed |
| `transition` | `transition-all` | More specific transition naming |

Example migration:

```tsx
// Before
<div className="grid grid-cols-2 gap-4 p-4 border border-opacity-50 shadow-md transition">
  {/* Content */}
</div>

// After
<div className="grid grid-cols-2 gap-4 p-4 border border-opacity-[0.5] shadow-medium transition-all">
  {/* Content */}
</div>
```

### 5. JIT-Only Mode Considerations

With JIT-only mode, ensure all your Tailwind classes are:

1. Properly declared in your component files
2. No runtime class generation without safety measures
3. All arbitrary values properly formatted with square brackets

```tsx
// Before (might not work in Tailwind 4)
<div className={`bg-${color}-500 p-${size}`}>

// After (safe for Tailwind 4)
<div className={`bg-[${color}] p-[${size}px]`}>
```

## Testing Migration

### 1. Update Jest Configuration

Update your `jest.config.mjs` file:

```javascript
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
};

export default createJestConfig(customJestConfig);
```

### 2. Update Jest Setup

Update your `jest.setup.ts` file:

```typescript
import '@testing-library/jest-dom';
import * as React from 'react';

// Mock environment variables
Object.defineProperty(process.env, 'NEXT_PUBLIC_SUPABASE_URL', {
  value: 'https://example.supabase.co',
  configurable: true
});

Object.defineProperty(process.env, 'NEXT_PUBLIC_SUPABASE_ANON_KEY', {
  value: 'example-anon-key',
  configurable: true
});

// Mock components and UI elements
jest.mock('@radix-ui/react-tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('lucide-react', () => ({
  ArrowRight: () => <span>→</span>,
  // Mock other used icons
}));
```

### 3. Use Testing Best Practices

1. Use `data-testid` attributes to select elements:

```tsx
// Component
<div data-testid="settlement-item-0">
  <p data-testid="settlement-users-0">{user1} → {user2}</p>
</div>

// Test
const item = screen.getByTestId('settlement-item-0');
const users = screen.getByTestId('settlement-users-0');
expect(users).toHaveTextContent('User1');
```

2. Use `toHaveTextContent` instead of direct equality checks:

```tsx
// Before (might fail with React 19)
expect(screen.getByText('User1 → User2')).toBeInTheDocument();

// After (works with React 19)
const element = screen.getByTestId('settlement-users-0');
expect(element).toHaveTextContent('User1');
expect(element).toHaveTextContent('User2');
```

## Troubleshooting

### Common Issues and Solutions

1. **Issue**: Text content tests failing
   **Solution**: Use `data-testid` attributes and `toHaveTextContent` instead of exact text matching

2. **Issue**: Server/client component boundary errors
   **Solution**: Ensure 'use client' directive is at the top of client component files

3. **Issue**: Hook dependency warnings
   **Solution**: Review effect dependencies and implement proper cleanup functions

4. **Issue**: Tailwind classes not applying correctly
   **Solution**: Check for renamed utilities and update to the new JIT-specific syntax

5. **Issue**: Type errors after updating React types
   **Solution**: Replace `React.FC` with explicit function types and props interfaces

6. **Issue**: Concurrent rendering issues
   **Solution**: Wrap data-fetching components in Suspense boundaries

For any additional issues, consult the detailed [React 19 documentation](https://react.dev/) or the [Tailwind CSS 4 documentation](https://tailwindcss.com/).
