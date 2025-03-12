# TypeScript Configuration Guide

## Configuration Structure

```
config/typescript/
├── tsconfig.json        # Base configuration
├── tsconfig.node.json   # Node.js specific configuration
└── tsconfig.app.json    # Application-specific configuration
```

## Configurations

### Base Configuration (tsconfig.json)
The root configuration that other configs extend from.

### Node Configuration (tsconfig.node.json)
Configuration for Node.js environments and build scripts:
- Build tools
- Development scripts
- Test configurations

### Application Configuration (tsconfig.app.json)
Configuration specific to the React application:
- React/JSX settings
- Module resolution
- Path aliases

## Deployment

- Vercel for deployment
- Automatic TypeScript compilation
- Type checking in CI/CD pipeline

## Path Aliases
The project uses TypeScript path aliases for better code organization:

```typescript
{
  "@/*": ["src/*"],
  "@components/*": ["src/components/*"],
  "@lib/*": ["src/lib/*"],
  "@utils/*": ["src/utils/*"],
  "@hooks/*": ["src/hooks/*"],
  "@config/*": ["config/*"]
}
```

## TypeScript Utility Scripts

### Fix TypeScript Issues
```bash
# Fix all TypeScript issues
npm run fix:ts

# Fix specific issues
npm run fix:ts:unused     # Fix unused variables
npm run fix:ts:comments   # Fix TypeScript comments
npm run fix:ts:entities   # Fix React JSX entities
```

### Development Tools
- ESLint with TypeScript support
- Prettier for consistent formatting
- TypeScript-specific linting rules
- Import sorting and organization

## Best Practices

### Type Safety
- Use strict type checking
- Avoid `any` type
- Prefer interfaces over types for objects
- Use type guards for runtime checks
- Implement proper error types

### Code Organization
- Follow feature-based structure
- Use barrel exports (index.ts)
- Implement proper type exports
- Maintain consistent naming

### Error Handling
```typescript
// Use type guards for error handling
function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

// Convert unknown errors to typed errors
function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;
  
  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    return new Error(String(maybeError));
  }
}
```

### React Components
- Use functional components
- Implement proper prop types
- Use React.FC with explicit types
- Implement proper event types

## Build Process
The TypeScript build process is integrated with:
- Vite for development and production builds
- Vitest for testing
- ESLint for linting

## Continuous Integration
TypeScript checks are part of the CI/CD pipeline:
- Type checking in GitHub Actions
- Linting in pull requests
- Build validation
- Test type coverage
