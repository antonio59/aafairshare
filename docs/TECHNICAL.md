# Technical Documentation

## Performance Optimization Guide

This document provides detailed technical information about the performance optimizations implemented in the AA FairShare application.

## Table of Contents
- [UI Components](#ui-components)
- [Accessibility](#accessibility)
- [Code Splitting](#code-splitting)
- [Performance Monitoring](#performance-monitoring)
- [Image Optimization](#image-optimization)
- [State Management](#state-management)
- [Service Worker](#service-worker)
- [Build Optimization](#build-optimization)

## UI Components

### Component Architecture
```typescript
// Example from enhanced-select.tsx
export function EnhancedSelect<T>({ 
  value, 
  onChange, 
  options, 
  groupBy 
}: EnhancedSelectProps<T>) {
  // Optimized rendering with proper memoization
  const groups = useMemo(() => groupOptions(options, groupBy), [options, groupBy]);
  
  return (
    <Command>
      <CommandInput />
      <CommandList>
        {groups.map(group => (
          <CommandGroup key={group.label}>
            {group.items.map(item => (
              <CommandItem key={item.value} onSelect={() => onChange(item.value)} />
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  );
}
```

### Component Features
- Built on Radix UI primitives
- Fully accessible
- Keyboard navigation
- Form validation with Zod
- Toast notifications
- Loading states
- Error handling

## Accessibility

### ARIA Support
```typescript
// Example from user-select.tsx
<DropdownMenuTrigger
  aria-label="User menu"
  aria-expanded={isOpen}
  aria-haspopup="menu"
>
  <UserAvatar />
</DropdownMenuTrigger>
```

### Keyboard Navigation
- Tab navigation
- Arrow key support
- Enter/Space activation
- Escape to close
- Type to select

### Focus Management
```typescript
// Example from tag-input.tsx
const TagInput = forwardRef<HTMLDivElement, TagInputProps>((props, ref) => {
  const [focused, setFocused] = useState(false);
  
  return (
    <Command
      ref={ref}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      data-focused={focused}
    >
      {/* Component content */}
    </Command>
  );
});
```

## Code Splitting

### Route-Based Splitting
```typescript
// Example from App.tsx
const ExpenseList = lazy(() => import('./components/ExpenseList'));
const Analytics = lazy(() => import('./components/Analytics'));
```

- Components are loaded on-demand when routes are accessed
- Each route becomes a separate chunk
- Suspense boundaries handle loading states

### Dynamic Imports
```typescript
// Example from exportUtils.ts
const loadPdfMake = async () => {
  const pdfMake = await import('pdfmake/build/pdfmake');
  const pdfFonts = await import('pdfmake/build/vfs_fonts');
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
  return pdfMake;
};
```

## Performance Monitoring

### Web Vitals Tracking
```typescript
// Example from performance-monitor.ts
function initializeVitalsTracking(): void {
  onCLS(handleMetric);
  onFID(handleMetric);
  onLCP(handleMetric);
  onFCP(handleMetric);
  onTTFB(handleMetric);
}
```

### Custom Metrics
- Component render timing
- User interactions
- API response times
- Resource loading

## Image Optimization

### Responsive Images
```typescript
// Example from optimized-image.tsx
const generateSrcSet = (src: string, sizes: number[]): string => {
  return sizes
    .map(size => `${src}?width=${size} ${size}w`)
    .join(', ');
};
```

### WebP Support
- Automatic WebP generation
- Fallback for older browsers
- Size optimization
- Lazy loading

## State Management

### Store Optimization
```typescript
// Example from store-optimizer.ts
export function useShallowSelector<T, U>(
  store: StoreOptimizer<T>,
  selector: (state: T) => U
): U {
  // Optimized subscription handling
}
```

### Persistence Strategy
- Local storage integration
- Selective persistence
- Memory management
- State rehydration

## Service Worker

### Caching Strategies
```typescript
// Example from service-worker.ts
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60,
      }),
    ],
  })
);
```

### Offline Support
- Background sync
- Offline fallback
- Resource caching
- API request queueing

## Build Optimization

### Vite Configuration
```typescript
// Example from vite.config.ts
export default defineConfig({
  build: {
    modulePreload: {
      polyfill: true,
      resolveDependencies: (filename, deps) => deps,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          // Other chunks...
        },
      },
    },
  },
});
```

### Asset Optimization
- CSS code splitting
- Tree shaking
- Module preloading
- Chunk size optimization

## Best Practices

### Component Optimization
1. Use React.memo for pure components
2. Implement useMemo and useCallback where appropriate
3. Avoid unnecessary re-renders
4. Optimize event handlers

### Data Loading
1. Implement data prefetching
2. Use suspense boundaries
3. Handle loading states
4. Optimize API calls

### Memory Management
1. Clean up event listeners
2. Dispose of resources
3. Handle component unmounting
4. Monitor memory usage

## Monitoring and Analytics

### Performance Metrics
- Core Web Vitals
- Custom timing metrics
- User experience metrics
- Resource timing

### Debugging Tools
1. Chrome DevTools Performance tab
2. React DevTools Profiler
3. Lighthouse audits
4. Custom performance logging

## Future Optimizations

### Planned Improvements
1. Implement resource hints (preload, prefetch)
2. Add HTTP/2 server push
3. Optimize third-party scripts
4. Enhance caching strategies

### Monitoring
1. Set up performance budgets
2. Implement automated performance testing
3. Add real user monitoring (RUM)
4. Create performance dashboards
