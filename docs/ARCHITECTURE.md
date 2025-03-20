# Application Architecture

## Directory Structure

```
psrc/
├── app/                  # Next.js App Router pages and API routes
│   ├── api/              # API routes
│   │   ├── expenses/     # Expense-related endpoints
│   │   ├── settlements/  # Settlement-related endpoints
│   │   └── users/        # User-related endpoints
│   ├── expenses/         # Expense feature pages
│   ├── settlements/      # Settlement feature pages
│   ├── auth/             # Authentication pages
│   ├── settings/         # Settings pages
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
│
├── components/           # Shared components
│   ├── ui/              # UI components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   └── tabs.tsx
│   ├── NavBar.tsx
│   └── error-boundary.tsx
│
├── contexts/            # React contexts
│   └── AuthContext.tsx
│
├── features/            # Feature-based modules
│   ├── expenses/        # Expense management feature
│   │   ├── components/  # Feature-specific components
│   │   ├── hooks/      # Feature-specific hooks
│   │   └── utils/      # Feature-specific utilities
│   ├── auth/           # Authentication feature
│   ├── settlements/    # Settlement feature
│   └── shared/         # Shared utilities
│
├── hooks/              # Global hooks
│   └── useExport.ts
│
└── utils/              # Global utilities
    ├── api-fetcher.ts
    ├── date-utils.ts
    └── exportService.ts
```

## Feature Module Structure

Each feature module follows a consistent structure:

### Components
- Feature-specific components
- Container components
- Feature-specific layouts

### Hooks
- Custom hooks for feature logic
- State management hooks
- Effect hooks

### Utils
- Feature-specific utilities
- Validation logic
- Helper functions

## App Directory Structure

The app directory uses Next.js 13+ App Router structure:

### API Routes
- Route handlers using the new Next.js API format
- Organized by feature (expenses, settlements, users)
- Clean separation of concerns

### Pages
- Page components using the new App Router format
- Layouts shared across routes
- Loading and error states

## Best Practices

### Feature Organization
1. Keep features isolated and independent
2. Share code through the shared module
3. Maintain clear boundaries between features
4. Co-locate related code within feature directories

### Code Organization
1. Use the App Router pattern for pages and API routes
2. Keep shared components in the components directory
3. Place global hooks and contexts at the root level
4. Maintain consistent file naming conventions

### State Management
1. Use React Context for global state
2. Keep feature-specific state within feature modules
3. Utilize custom hooks for state logic
4. Follow the principle of lifting state up when needed

### Component Organization
1. Separate UI components into the ui/ directory
2. Keep feature-specific components within feature modules
3. Use composition over inheritance
4. Follow atomic design principles where applicable

## Adding New Features

To add a new feature:

1. Create feature directory in src/features/
2. Add necessary components, hooks, and utilities
3. Create corresponding pages in src/app/
4. Add API routes if required
5. Update documentation

## Security Considerations

1. Implement proper authentication in API routes
2. Use type-safe database queries
3. Follow security best practices for user data
4. Implement proper error handling

## Performance Optimization

1. Use proper caching strategies
2. Implement lazy loading where appropriate
3. Optimize API responses
4. Follow Next.js performance best practices