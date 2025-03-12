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
├── postcss.config.ts # PostCSS configuration
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

## Troubleshooting

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