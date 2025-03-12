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
- `VITE_SENTRY_DSN`

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
- Sentry integration for error tracking
- Detailed error context and breadcrumbs
- Performance monitoring
- User session replay for critical issues

For detailed security documentation, see [docs/security.md](./docs/security.md)
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