# TypeScript Configuration Guide

## Configuration Structure

The project uses a modular TypeScript configuration approach with multiple configuration files organized in a structured manner:

```
config/typescript/
  ├── tsconfig.base.json    # Base shared configuration
  ├── tsconfig.json         # Main Next.js application config
  ├── tsconfig.node.json    # Node.js scripts configuration
  └── tsconfig.vercel.json  # Vercel serverless functions configuration

tsconfig.json              # Root configuration (extends from modular structure)
```

## Base Configuration (tsconfig.base.json)

The base configuration includes common settings shared across all configurations:
- TypeScript language features
- Module resolution
- Path aliases
- Strict type checking
- Common compiler options

## Application Configuration (tsconfig.json)

Extends the base configuration and adds:
- Next.js specific settings
- React/JSX configuration
- App-specific include patterns

## Node.js Configuration (tsconfig.node.json)

Extends the base configuration and adds:
- Node.js specific module resolution
- Script-specific output settings
- Node-specific target environment

## Vercel Configuration (tsconfig.vercel.json)

Extends the base configuration and adds:
- Vercel Edge and Serverless function settings
- Next.js API route optimizations
- Vercel-specific deployment configurations

## Path Aliases

The project uses TypeScript path aliases for better code organization:

```typescript
{
  "@/*": ["./src/*"],
  "@components/*": ["./src/components/*"],
  "@lib/*": ["./src/lib/*"],
  "@utils/*": ["./src/utils/*"],
  "@hooks/*": ["./src/hooks/*"],
  "@config/*": ["./config/*"]
}
```

## Development Tools

### Code Quality Tools
- ESLint with TypeScript support
- Prettier for consistent formatting
- TypeScript-specific linting rules
- Import sorting and organization

### Testing Tools
- Playwright for E2E testing
- Vitest for unit testing
- Lighthouse for performance testing

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

### Development
- Next.js for development and production builds
- Hot module replacement
- TypeScript type checking

## Spell Checking

### Configuration Structure
The project uses CSpell for spell checking, integrated with the TypeScript development workflow:

```json
// cspell.json
{
  "version": "0.2",
  "language": "en",
  "words": [
    "supabase",
    "headlessui",
    "chartjs"
    // ... other technical terms
  ],
  "ignorePaths": [
    "node_modules/**",
    "dist/**"
  ],
  "allowCompoundWords": true,
  "ignoreRegExpList": [
    "[A-Z]{3,}",
    "[0-9]+[A-Za-z]+",
    "[A-Za-z]+[0-9]+"
  ]
}
```

### Integration with Build Process
- Part of the lint workflow via `npm run lint:spell`
- Checks TypeScript, JavaScript, JSON, and Markdown files
- Integrated with ESLint for comprehensive code quality

### Technical Terms Dictionary
Maintains a curated list of technical terms specific to our stack:
- Framework terms (Next.js, React, TypeScript)
- UI components (Shadcn, Radix, Headless UI)
- Database and API (Supabase)
- Development tools and libraries

### Best Practices
- Add new technical terms to `cspell.json` instead of disabling checks
- Use `allowCompoundWords` for component names
- Maintain consistent casing in documentation
- Follow TypeScript naming conventions

### Testing
- Automated E2E tests with Playwright
- Unit tests with Vitest
- Performance testing with Lighthouse
- Security scanning with Snyk

## Continuous Integration

### GitHub Actions Pipeline
- Type checking
- Linting
- Unit tests
- E2E tests
- Security scans
- Performance benchmarks

### Deployment
- Vercel for production deployment
- Automatic TypeScript compilation
- Environment-specific configurations
- Security and performance monitoring
