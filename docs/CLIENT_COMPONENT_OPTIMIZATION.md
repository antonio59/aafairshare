# Client Component Optimization Guide for React 19

This guide outlines best practices for optimizing client components in our Next.js application with React 19 and Tailwind CSS 4.

## Component Export Standardization

We've implemented a standardized export pattern for all UI components to ensure consistency:

```tsx
// Import the utility function
import { createComponentExports } from "@/lib/component-utils";

// Define your component
const ButtonComponent = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  // Component implementation
});

// Create standardized exports
const { PascalCase: Button, lowercase: button } = createComponentExports(ButtonComponent, "Button");

// Export both versions
export { Button, button };
```

This approach:
- Maintains both PascalCase and lowercase exports for compatibility
- Sets proper displayName for better debugging
- Reduces code duplication
- Follows TypeScript-first principles

## Minimizing `use client` Directives

Only add `'use client'` to components that:
- Use browser-only APIs
- Use React hooks that require client-side execution
- Need to handle user interactions directly

Prefer Server Components whenever possible for:
- Data fetching
- Static rendering
- Components that don't need interactivity

## Optimizing React Hooks Usage

### useState

- Use URL state management with `nuqs` for shareable state
- Consolidate related state into a single object
- Consider using reducers for complex state logic

```tsx
// Instead of multiple useState calls
const [name, setName] = useState("");
const [email, setEmail] = useState("");

// Use a single state object
const [formData, setFormData] = useState({ name: "", email: "" });
```

### useEffect

- Avoid using useEffect for data fetching (use React 19 data fetching patterns)
- Preload components using module initialization instead of useEffect
- Use cleanup functions to prevent memory leaks

```tsx
// Instead of useEffect for preloading
useEffect(() => {
  import('./SomeComponent');
}, []);

// Use immediate invocation at module level
(() => {
  import('./SomeComponent');
})();
```

## Proper Suspense Boundaries

- Use Suspense boundaries strategically to improve UX
- Group related components under a single Suspense boundary
- Provide meaningful fallback UI that matches the expected layout

```tsx
// Optimized Suspense usage
<Suspense fallback={<SkeletonLayout />}>
  <ComponentGroup />
</Suspense>
```

## React 19 Concurrent Features

### useTransition

Use `useTransition` for expensive state updates:

```tsx
const [isPending, startTransition] = useTransition();

const handleChange = (value) => {
  // Wrap expensive updates in startTransition
  startTransition(() => {
    setFilteredResults(calculateFilteredResults(value));
  });
};
```

### Lazy Loading

Use dynamic imports with proper loading indicators:

```tsx
const Component = lazy(() => import('./Component'));

// In your JSX
<Suspense fallback={<Skeleton />}>
  <Component />
</Suspense>
```

## Performance Monitoring

Monitor these metrics after optimizations:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Interaction to Next Paint (INP)
- JavaScript bundle size

## Migration Checklist

- [ ] Standardize component exports
- [ ] Review and minimize `use client` directives
- [ ] Optimize React hooks usage
- [ ] Implement proper Suspense boundaries
- [ ] Use React 19 concurrent features
- [ ] Monitor performance metrics
