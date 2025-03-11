# Development Tools and Scripts

This document provides information about the development tools and utility scripts available in the Expense Sharing App.

## Scripts Directory

The `scripts/` directory contains utility scripts used for development, maintenance, and operational tasks. These scripts are organized separately from the application code to keep the project root clean and make utility scripts easier to find and manage.

### Available Scripts

#### TypeScript Fixes and Linting

- **`fix-typescript-issues.js`** - A comprehensive script to fix various TypeScript and linting issues
  ```bash
  # Fix all issues (unused variables, TS comments, unescaped entities)
  npm run fix:ts
  
  # Fix only unused variables (prefixes them with underscore)
  npm run fix:ts:unused
  
  # Fix TypeScript comments (convert @ts-ignore to @ts-expect-error)
  npm run fix:ts:comments
  
  # Fix unescaped entities in JSX (like quotes and angle brackets)
  npm run fix:ts:entities
  ```

#### Database Scripts

- **`db-backup.js`** - Backs up the database to a local file
  ```bash
  npm run db:backup
  ```

- **`run-migration.sh`** - Executes database migrations
  ```bash
  ./scripts/run-migration.sh
  ```

#### Development Server

- **`start-dev.sh`** - Starts the development server with proper cleanup
  ```bash
  npm run dev
  ```

### JavaScript vs TypeScript for Scripts

The utility scripts in this project are written in JavaScript (.js) rather than TypeScript (.ts) for several reasons:

1. **Direct Execution** - JavaScript files can be run directly with Node.js without a compilation step, making them more convenient for utility scripts.

2. **Simplicity** - For utility scripts that don't need to be part of the main application, the type safety of TypeScript isn't as critical.

3. **Portability** - JavaScript scripts have fewer dependencies and are easier to run in different environments.

4. **Maintenance** - Utility scripts are generally simpler and change less frequently than application code.

## Adding New Scripts

When adding new scripts to the project:

1. Always place them in the `scripts` directory, not in the project root.
2. Make executable scripts with `chmod +x scripts/your-script.js`.
3. Add a description in the `scripts/README.md` file.
4. Consider adding an npm script in `package.json` for frequently used scripts.
5. Update this documentation if the script provides significant functionality.

## NPM Scripts

The project includes several npm scripts defined in `package.json` to make common tasks easier:

```bash
# Development
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build

# Testing
npm run test           # Run tests
npm run test:ui        # Run tests with UI
npm run test:coverage  # Run tests with coverage report

# Linting and fixes
npm run lint           # Run ESLint
npm run fix:ts         # Fix TypeScript issues (see above)

# Security
npm run security:audit # Run security audit
npm run security:fix   # Fix security issues

# Database
npm run db:backup      # Back up the database
```

For a complete list of available npm scripts, refer to the `scripts` section in `package.json`.

## GitHub Actions Workflows

The project uses GitHub Actions for automation of various tasks. These workflows are defined in the `.github/workflows/` directory.

### Database Backup Workflow

The `db-backup.yml` workflow handles automated database backups:

- **Schedule**:
  - Daily schema-only backup at 1:00 UTC
  - Weekly full backup on Sundays at 2:00 UTC
  
- **Manual Trigger**:
  - Can be run manually with choice of backup type (schema or full)
  
- **Features**:
  - Runs the database backup script from `scripts/db-backup.js`
  - Stores backups in GitHub Artifacts for short-term retention
  - Uploads backups to S3 for long-term storage
  - Sends Slack notifications on failure

- **Configuration**:
  This workflow requires several secrets to be configured in the GitHub repository:
  - Supabase credentials
  - Database connection details
  - AWS credentials for S3 access
  - Slack webhook for notifications

To view or modify this workflow, see `.github/workflows/db-backup.yml`. 