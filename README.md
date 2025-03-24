# Expense Sharing App - Deployment Guide

[![Known Vulnerabilities](https://snyk.io/test/github/antonio59/aafairshare/badge.svg)](https://snyk.io/test/github/antonio59/aafairshare)
[![TypeScript Validation](https://github.com/antonio59/aafairshare/actions/workflows/typescript-checks.yml/badge.svg)](https://github.com/antonio59/aafairshare/actions/workflows/typescript-checks.yml)
[![UI Type Coverage](https://github.com/antonio59/aafairshare/actions/workflows/ui-typescript-checks.yml/badge.svg)](https://github.com/antonio59/aafairshare/actions/workflows/ui-typescript-checks.yml)

## Migration Status

✅ **React 19 & Tailwind 4 Migration Completed**

As of March 21, 2025, the project has been successfully upgraded to React 19 and Tailwind CSS 4!

### Completed Milestones

#### Core Dependencies
- ✅ Updated to React 19.0.0 and React DOM 19.0.0
- ✅ Updated to Tailwind CSS 4.0.0
- ✅ Updated all related types and dependencies
- ✅ Configured PostCSS for Tailwind 4 compatibility

#### Component Architecture
- ✅ Implemented proper server/client component boundaries
- ✅ Added effect cleanup functions for React 19 compatibility
- ✅ Upgraded to dynamic imports for client components
- ✅ Fixed hook dependencies and effect cleanups

#### Testing Infrastructure
- ✅ Updated Jest configuration for React 19
- ✅ Created Supabase mocks for testing
- ✅ Enhanced component tests with data-testid attributes
- ✅ Fixed date handling for null/undefined values
- ✅ Fixed Tooltip and ScrollArea component mocks for React 19 compatibility
- ✅ Implemented proper testing utilities for React 19 concurrent mode

#### UI Improvements
- ✅ Fixed logo size on sign-in page
- ✅ Updated favicon to AA branding
- ✅ Disabled sign-up functionality (preserving the page for future use)

### Technical Documentation

For detailed technical information about the upgrade, see [docs/react19-upgrade.md](./docs/react19-upgrade.md).

### Performance Improvements

The React 19 upgrade has delivered significant performance improvements:

- **Faster rendering:** Up to 30% improvement in rendering performance
- **Reduced bundle size:** Smaller runtime due to optimized React internals
- **Improved memory usage:** Better memory management with automatic effect cleanup
- **Enhanced concurrent features:** Better handling of user interactions during rendering

### Tailwind CSS 4 Benefits

- **Simplified syntax:** More intuitive class naming conventions
- **Improved dark mode:** Enhanced support for dark mode transitions
- **Better responsive design:** New mobile-first responsive utilities
- **Reduced CSS size:** More efficient compilation of utility classes

## Overview
This is a React-based expense sharing application built with Vite and Supabase. The app allows users to track shared expenses, manage settlements, and handle currency conversions.

> **Note:** For detailed technical documentation, see the [docs/](./docs/) directory. An index of available documentation is provided in [docs/index.md](./docs/index.md).

## Prerequisites
- Node.js v18.17 or higher (v20+ recommended)
- npm or pnpm package manager
- Supabase account and project

## React 19 & Tailwind 4 Breaking Changes

### React 19 Breaking Changes

- **Effect Cleanup:** All `useEffect` hooks must return cleanup functions when subscribing to events or timers
- **Server Components:** Stricter separation between server and client components
- **Suspense:** Enhanced behavior with better error reporting
- **Concurrent Features:** Automatic batching of state updates by default

### Tailwind CSS 4 Breaking Changes

- **JIT by Default:** Just-in-Time mode is now the only option
- **Config Structure:** Updated plugin system and configuration options
- **Variant Syntax:** Some variant combinations have changed
- **Color System:** New color generation system with improved accessibility

For a complete list of breaking changes and migration strategies, see [docs/migration-guide.md](./docs/migration-guide.md)

## TypeScript Configuration
This project uses a modular TypeScript configuration for enhanced type safety and better code organization. See [docs/typescript.md](./docs/typescript.md) for detailed documentation.

### Key Features
- Strict type checking enabled
- Path aliases for better imports
- Specialized configs for different contexts
- Advanced error handling with type guards

## Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development
1. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. Start development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

3. Development Tools and Scripts
   
   The project includes several utility scripts to assist with development:
   
   ```bash
   # TypeScript Fixes and Validation
   npm run fix:ts           # Fix all TypeScript issues
   npm run fix:ts:unused    # Fix only unused variables
   npm run fix:ts:comments  # Fix TypeScript comments
   npm run fix:ts:entities  # Fix unescaped entities in JSX
   
   # Development and Testing
   npm run dev              # Start development server
   npm run test             # Run tests with Vitest
   npm run build           # Build for production
   ```
   
   For more information about:
   - Development tools and scripts: [docs/development-tools.md](./docs/development-tools.md)
   - TypeScript configuration: [docs/typescript.md](./docs/typescript.md)

## Production Deployment

### Vercel Deployment
The application is configured for deployment on Vercel:

1. Push your code to the GitHub repository
2. Vercel will automatically deploy from the main branch
3. Preview deployments are created for pull requests
4. Production deployments happen automatically on merge to main

### Environment Variables on Vercel
Set the following environment variables in your Vercel project settings:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Deployment Commands
```bash
# Deploy to staging/preview
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

### Automatic Deployments
- Push to `main` branch triggers production deployment
- Pull requests create preview deployments
- All deployments run through CI/CD pipeline with tests

## Security Best Practices

### Authentication
- The app uses Supabase Auth with email OTP (magic link) authentication
- Session management is handled securely through Supabase
- Implement rate limiting for authentication attempts

### Data Security
- All database operations are performed through Supabase's secure API
- Row Level Security (RLS) policies are implemented in Supabase
- Sensitive data is never exposed in client-side code

### Frontend Security
- Content Security Policy (CSP) headers are configured
- Security headers are set for protection against common web vulnerabilities
- HTTPS is enforced for all connections

### Error Handling
- Production errors are caught and logged appropriately
- Users are shown friendly error messages
- Sensitive error details are never exposed to the client

## Maintenance

### Regular Tasks
1. Monitor Supabase database usage and performance
2. Review and update dependencies regularly
3. Check Vercel deployment logs for any issues
4. Monitor application error logs

## Data Management

Expenses can be exported directly from the UI in the Settings page. Navigate to Settings > Export Data to download your expense data in CSV format.

## Support
For issues and support:
1. Check the deployment logs in Vercel dashboard
2. Review Supabase logs for backend issues
3. Contact the development team for critical issues

## License
This project is proprietary and confidential.

# Security and Dependencies

## Security Features

This application implements comprehensive security measures:

### Input Validation & Sanitization
- Zod schema validation for all inputs
- Financial data sanitization
- Type checking and constraints
- Maximum value limits

### CSRF Protection
- UUID v4 token generation
- Automatic token validation
- Integration with Supabase client

### Content Security Policy
- Strict CSP headers
- XSS prevention
- Frame protection
- Resource loading restrictions

### Error Monitoring & Tracking
- Custom error boundaries for component-level error handling
- Detailed error logging and reporting
- Client-side error recovery

For detailed security documentation, see [docs/security.md](./docs/security.md)

## Automated Security Monitoring

This project uses automated security monitoring and dependency updates with a unified testing configuration:

- **Daily Security Scans**: Automated checks run daily via GitHub Actions, with results in consolidated HTML reports
- **Unified Test Configuration**: Shared configuration in `config/test/base.config.ts` for consistent testing across environments
- **Dependency Updates**: Weekly Dependabot PRs for outdated packages
- **Vulnerability Scanning**: Using Snyk and npm audit with comprehensive test coverage

### Quick Commands

```bash
# Run security audit with HTML report
npm run security:audit

# Fix vulnerabilities
npm run security:fix

# Update dependencies
npm run security:update
```

## Architecture

This application follows a feature-based architecture for better scalability and maintainability. See [docs/architecture.md](./docs/architecture.md) for detailed documentation.

### Key Features
- **Expenses**: Complete expense management
- **Settlements**: Settlement tracking and calculations
- **Authentication**: User authentication and session management

### Directory Structure
```
src/
├── features/          # Feature-based modules
│   ├── expenses/     # Expense management
│   ├── auth/         # Authentication
│   ├── settlements/  # Settlements
│   └── shared/       # Shared utilities
├── core/             # Core application code
├── styles/           # Global styles
└── pages/           # Page components

scripts/              # Utility scripts
├── migrations/      # Database and code migration scripts
└── ...              # Other utility scripts

docs/                 # Detailed documentation
├── architecture.md  # Architecture details
├── security.md      # Security implementation
├── performance-optimizations.md # Performance details
└── supabase-migration.md # Migration guides

config/              # Configuration files
├── postcss.config.cjs # PostCSS configuration
└── tailwind.config.ts # Tailwind CSS configuration
```

## Keeping Supabase Instance Active

To prevent your Supabase instance from pausing due to inactivity (common with free tier instances), this project includes a script that pings the Supabase instance weekly.

### Manual Execution

You can manually trigger the ping script with:

```bash
npm run keep-supabase-alive
```

### Setting Up the Weekly Cron Job

To automatically keep your Supabase instance active, you can set up a cron job to run weekly:

```bash
npm run setup-supabase-cron
```

This will:
1. Set up a cron job that runs every Sunday at 1:00 AM
2. Log the output to `logs/supabase-ping.log`
3. Create the logs directory if it doesn't exist

### Verifying the Cron Job

To verify that the cron job was set up correctly:

```bash
crontab -l
```

You should see a line containing `keep-supabase-alive`.

## Project Maintenance & Troubleshooting

### TypeScript & Build System

The project uses strict TypeScript configuration with the `verbatimModuleSyntax: true` option, which requires careful handling of type imports. To help maintain the codebase, several utility scripts have been created:

```bash
# Fix TypeScript issues
npm run fix:ts       # Fix all TypeScript issues automatically
npm run fix:all      # Fix TypeScript, run linting, and format code
```

The `fix:ts` script addresses several common issues:
- Converts regular imports to type imports where appropriate
- Fixes Supabase client usage to properly await the Promise
- Updates cookie handling for Next.js 15 compatibility
- Standardizes auth context usage across components

### Fixing Build Failures

If you encounter build failures, run these commands in sequence:

```bash
# Step 1: Fix TypeScript issues
npm run fix:ts

# Step 2: Run TypeScript type checking
npm run typecheck

# Step 3: Run ESLint to fix linting issues
npm run lint:fix

# Step 4: Format code consistently
npm run format

# Step 5: Try building again
npm run build
```

### Blank Screen Issue

If you encounter a situation where the application becomes blank/white (with only the header and footer visible), this is typically caused by an authentication issue where your session token has expired but hasn't been properly refreshed.

To resolve this:

1. **Clear browser cache and cookies** - This will log you out and force a fresh authentication
2. **Try refreshing the page** - The app includes an automatic session refresh mechanism that might resolve the issue
3. **Check your network connection** - The app requires a stable internet connection to communicate with Supabase

If the issue persists:

1. Log out completely and log back in
2. Make sure your browser is updated to the latest version
3. Try using a different browser to rule out browser-specific issues

The application has been updated with improved error handling and session refresh mechanisms that should prevent this issue in most cases.

### Developer Notes

If you're developing or maintaining this application, we've implemented the following improvements to handle authentication and network errors:

1. **Session Refresh Mechanism**: Added retry logic with automatic session refresh for API calls
2. **Network Error Detection**: Added online/offline detection with visual feedback
3. **Loading States**: Improved loading states to avoid blank screens during data fetching
4. **Global Error Handling**: Added global error catching for fetch operations

The core utilities for these features are in:
- `src/utils/api-fetcher.ts` - Retry utility with session refresh
- `src/core/contexts/AuthContext.tsx` - Extended auth context with refresh capability
- `src/features/auth/components/ProtectedRoute.tsx` - Enhanced error handling for route protection

## Recent Simplifications

The application has been recently simplified by removing several features:

1. **Currency Selection**: The app now exclusively uses GBP (£) as the currency.
2. **Language Settings**: All language selection options have been removed; the app now uses English only.
3. **Export Option**: Export functionality has been streamlined and is now only available in the analytics section.
4. **User Preferences**: The preferences column has been removed from the database to simplify the data model.
5. **Settings Table**: The entire settings table has been dropped as it's no longer needed.

These changes have resulted in a more maintainable codebase, better type safety, and improved performance. For full details on these changes and the migration path, please see the [currency-fix documentation](docs/currency-fix.md).

## Running the Update Script

If you've pulled the latest code, you'll need to run the update script to apply all the changes:

```bash
./scripts/apply-currency-fix.sh
```

This script will:
1. Create backups of all modified files
2. Convert the CurrencyContext to utility functions
3. Update all imports across the codebase
4. Run the database migrations if Supabase CLI is available