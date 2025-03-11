# Application Architecture

## Directory Structure

```
src/
├── features/                # Feature-based modules
│   ├── expenses/           # Expense management feature
│   │   ├── components/     # Expense-specific components
│   │   │   ├── ExpenseForm.jsx
│   │   │   ├── ExpenseList.jsx
│   │   │   └── ExpenseStats.jsx
│   │   ├── hooks/         # Expense-specific hooks
│   │   │   ├── useExpenseForm.js
│   │   │   └── useExpenseStats.js
│   │   ├── api/           # Expense API integration
│   │   │   ├── expenseApi.js
│   │   │   └── types.ts
│   │   ├── utils/         # Expense-specific utilities
│   │   │   ├── calculations.js
│   │   │   └── validation.js
│   │   └── index.js       # Feature entry point
│   │
│   ├── auth/              # Authentication feature
│   │   ├── components/    # Auth-specific components
│   │   ├── hooks/        # Auth-specific hooks
│   │   ├── api/          # Auth API integration
│   │   └── index.js
│   │
│   ├── settlements/       # Settlement feature
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── index.js
│   │
│   └── shared/           # Shared features
│       ├── components/   # Common UI components
│       ├── hooks/       # Common hooks
│       ├── utils/       # Common utilities
│       └── types/       # Shared type definitions
│
├── core/                 # Core application code
│   ├── config/          # App configuration
│   ├── api/             # API client setup
│   ├── router/          # Routing configuration
│   ├── store/           # State management
│   └── types/           # Core type definitions
│
├── styles/              # Global styles
│   ├── global.css
│   └── theme.js
│
└── pages/              # Page components
    ├── _app.jsx       # App wrapper
    ├── index.jsx      # Home page
    └── [...routes].jsx # Other pages
```

## Feature Module Structure

Each feature module follows a consistent structure:

### Components
- Presentational components
- Container components
- Feature-specific layouts

### Hooks
- Custom hooks for feature logic
- State management hooks
- Effect hooks

### API
- API integration
- Data transformations
- Type definitions

### Utils
- Feature-specific utilities
- Validation logic
- Helper functions

## Core Module Structure

The core module contains application-wide configurations:

### Config
- Environment variables
- App settings
- Feature flags

### API
- API client setup
- Request/response interceptors
- Error handling

### Router
- Route definitions
- Navigation guards
- Route utilities

### Store
- Global state management
- State persistence
- State synchronization

## Best Practices

### Feature Organization
1. Keep features isolated and independent
2. Share code through the shared module
3. Maintain clear boundaries between features
4. Export only what's necessary through index.js

### Code Organization
1. Co-locate related code
2. Keep feature-specific code within feature
3. Use barrel exports (index.js)
4. Maintain consistent file naming

### State Management
1. Keep state close to where it's used
2. Use feature-level state when possible
3. Global state only when necessary
4. Clear state ownership

### Component Organization
1. Feature-first component organization
2. Shared components in shared module
3. Clear component responsibilities
4. Consistent naming conventions

## Migration Guide

To migrate from the current structure:

1. Create new feature directories
2. Move related components
3. Update imports
4. Test feature isolation
5. Remove old directories

## Adding New Features

To add a new feature:

1. Create feature directory
2. Add necessary subdirectories
3. Create index.js
4. Update routing
5. Add to documentation 