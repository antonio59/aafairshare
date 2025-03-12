# Expense Sharing App - Deployment Guide

[![Known Vulnerabilities](https://snyk.io/test/github/antonio59/aafairshare/badge.svg)](https://snyk.io/test/github/antonio59/aafairshare)

## Overview
This is a React-based expense sharing application built with Vite and Supabase. The app allows users to track shared expenses, manage settlements, and handle currency conversions.

> **Note:** For detailed technical documentation, see the [docs/](./docs/) directory. An index of available documentation is provided in [docs/index.md](./docs/index.md).

## Prerequisites
- Node.js v18 or higher
- npm or pnpm package manager
- Supabase account and project

## TypeScript Configuration
This project uses a modular TypeScript configuration for enhanced type safety and better code organization. See [docs/TYPESCRIPT.md](./docs/TYPESCRIPT.md) for detailed documentation.

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
   - Development tools and scripts: [docs/DEVELOPMENT_TOOLS.md](./docs/DEVELOPMENT_TOOLS.md)
   - TypeScript configuration: [docs/TYPESCRIPT.md](./docs/TYPESCRIPT.md)

## Production Deployment

### Building the Application
1. Build the production bundle:
   ```bash
   npm run build
   # or
   pnpm build
   ```

2. Preview the production build locally:
   ```bash
   npm run preview
   # or
   pnpm preview
   ```

### Vercel Deployment
The application is configured for deployment on Vercel:

1. Push your code to a Git repository
2. Import your project to Vercel
3. Vercel will automatically detect the build settings
4. Environment variables will be automatically pulled from your Vercel project

### Environment Variables on Vercel
Set the following environment variables in Vercel's dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

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

### Automated Database Backups
The project uses GitHub Actions for automated database backups:
- Daily schema-only backups
- Weekly full database backups
- Automatic storage in both GitHub Artifacts and S3
- Error notifications via Slack

For details on the backup configuration and process, see [docs/DEVELOPMENT_TOOLS.md](./docs/DEVELOPMENT_TOOLS.md#database-backup-workflow).

### Troubleshooting
1. Check Vercel deployment status and build logs
2. Verify environment variables are correctly set
3. Review Supabase database connectivity
4. Check browser console for client-side errors

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
- Sentry integration for error tracking
- Detailed error context and breadcrumbs
- Performance monitoring
- User session replay for critical issues

For detailed security documentation, see [docs/SECURITY.md](./docs/SECURITY.md)
For Sentry integration details, see [docs/sentry-integration.md](./docs/sentry-integration.md)

## Automated Security Monitoring

This project uses automated security monitoring and dependency updates:

- **Daily Security Scans**: Automated checks run daily via GitHub Actions
- **Dependency Updates**: Weekly Dependabot PRs for outdated packages
- **Vulnerability Scanning**: Using Snyk and npm audit

### Quick Commands

```bash
# Run security audit
npm run security:audit

# Fix vulnerabilities
npm run security:fix

# Update dependencies
npm run security:update
```

## Architecture

This application follows a feature-based architecture for better scalability and maintainability. See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed documentation.

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
├── ARCHITECTURE.md  # Architecture details
├── SECURITY.md      # Security implementation
├── PERFORMANCE_OPTIMIZATIONS.md # Performance details
└── SUPABASE_MIGRATION.md # Migration guides

config/              # Configuration files
├── postcss.config.ts # PostCSS configuration
└── tailwind.config.ts # Tailwind CSS configuration
```

### Feature Organization
Each feature is self-contained with its own:
- Components
- Hooks
- API integration
- Utils
- Types
```

## Performance Features

### Database Optimizations

- **Strategic Indexing**: Optimized database indexes on frequently queried fields for faster data retrieval
- **Query Optimization**: Efficient query patterns and parameterized queries for better database performance
- **Connection Pooling**: Managed database connections for optimal resource utilization
- **Type Safety**: Updated TypeScript definitions to match the database schema including all tables and indexes

### Background Processing

- **Task Queue System**: Background processing for long-running operations like reports and settlements
- **Web Workers**: Offloading intensive calculations from the main thread for better UI responsiveness
- **Progress Tracking**: Real-time progress updates for long-running tasks

### Robustness Features

- **Error Handling**: Comprehensive error handling with fallbacks for all potential failure points
- **Type Guards**: Custom type validation to ensure data integrity throughout the application
- **Lifecycle Management**: Careful tracking of component mount state to prevent memory leaks
- **Request Timeouts**: Protection against unresponsive API calls with configurable timeouts
- **Progressive Enhancement**: Graceful degradation when advanced features like Web Workers are unavailable

## Maintenance and Migrations

### Supabase Client Migration

The application initially used multiple Supabase client instances, which could cause warnings and potential issues:

```
WARNING: Using deprecated supabase import from lib/supabase.ts. 
Update your import to use: import { supabase } from "@/core/api/supabase" instead.
```

#### Migration Solution

We've implemented a standardized approach to Supabase client usage:

1. **Single Client Instance**: All Supabase operations should use the client from `@/core/api/supabase`
2. **Backward Compatibility**: The old import path (`lib/supabase`) still works but displays a warning
3. **Automated Migration**: Scripts are provided to update imports automatically

For detailed documentation on the migration, see [docs/SUPABASE_MIGRATION.md](./docs/SUPABASE_MIGRATION.md).

#### Running the Migration Script

We provide several methods to update imports in your codebase:

**Option 1: Using npm script (easiest)**
```bash
npm run migrate:supabase
```

**Option 2: Using the shell script directly**
```bash
# Make the script executable if needed
chmod +x scripts/migrations/migrate-imports.sh

# Run the migration
./scripts/migrations/migrate-imports.sh
```

**Option 3: Running the TypeScript script directly**
```bash
# Using npx with tsx
npx tsx scripts/migrations/migrate-supabase-imports.ts

# Alternatively, using ts-node
npx ts-node scripts/migrations/migrate-supabase-imports.ts
```

#### What the Migration Script Does

The migration script:
1. Scans the codebase for imports using the pattern `import { supabase } from '../lib/supabase'`
2. Replaces them with the standardized import: `import { supabase } from '@/core/api/supabase'`
3. Provides a detailed report of changes made

#### Manual Migration Steps

If you prefer to manually update imports:

1. Search the codebase for `from 'lib/supabase'` or `from '../lib/supabase'` patterns
2. Replace each occurrence with `from '@/core/api/supabase'`
3. Ensure path aliases are properly configured in your `tsconfig.json`

#### Benefits of Standardized Imports

- Eliminates console warnings
- Prevents multiple Supabase client instances
- Reduces potential authentication conflicts
- Ensures consistent cache management
- Improves code maintainability