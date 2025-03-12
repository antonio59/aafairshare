# TypeScript Configuration and Best Practices

## Overview
This project uses TypeScript with a modular configuration structure for enhanced type safety, better code organization, and improved development experience.

## Configuration Structure

```
config/
├── typescript/
│   ├── tsconfig.base.json    # Base shared configuration
│   ├── tsconfig.json         # Main application configuration
│   ├── tsconfig.node.json    # Node.js scripts configuration
│   └── tsconfig.netlify.json # Netlify functions configuration
```

### Base Configuration (tsconfig.base.json)
The base configuration provides shared TypeScript settings used across all configurations:
- Target: ES2022
- Module: ESNext
- Strict type checking enabled
- Path aliases for consistent imports
- Common library includes

### Main Configuration (tsconfig.json)
Extends the base configuration with React and testing-specific settings:
- React JSX support
- Testing library types
- Source directory includes
- Component and utility path aliases

### Node.js Configuration (tsconfig.node.json)
Specialized configuration for Node.js scripts and tooling:
- Node.js type definitions
- Script directory includes
- Build tool configurations
- Utility script settings

### Netlify Configuration (tsconfig.netlify.json)
Configuration specific to Netlify functions and serverless:
- Serverless function settings
- Output directory configuration
- Node.js runtime settings
- Function-specific includes

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
- Netlify for deployment

## Continuous Integration
TypeScript checks are part of the CI/CD pipeline:
- Type checking in GitHub Actions
- Linting in pull requests
- Build validation
- Test type coverage
