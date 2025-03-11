# Project Scripts

This directory contains utility scripts for development, maintenance, and operational tasks.

## Available Scripts

### Development Scripts

- **`start-dev.sh`** - Starts the development server, ensuring no conflicting processes are running
  ```bash
  npm run dev
  ```

### Linting & TypeScript Fixes

- **`fix-typescript-issues.js`** - Consolidated script to fix various TypeScript and linting issues
  ```bash
  # Fix all issues
  node scripts/fix-typescript-issues.js 
  
  # Fix only unused variables
  node scripts/fix-typescript-issues.js --unused-vars
  
  # Fix only TypeScript comments (@ts-ignore to @ts-expect-error)
  node scripts/fix-typescript-issues.js --ts-comments
  
  # Fix only unescaped entities in JSX
  node scripts/fix-typescript-issues.js --entities
  ```

### Database Scripts

- **`db-backup.js`** - Backs up the database
  ```bash
  # Basic schema backup
  node scripts/db-backup.js
  
  # Full database backup including data
  node scripts/db-backup.js --full
  
  # Specify custom output directory
  node scripts/db-backup.js --output ./my-backups
  
  # Run via npm script
  npm run db:backup
  ```
  
  This script is also used by the GitHub Actions workflow (.github/workflows/db-backup.yml) 
  for automated daily and weekly backups. The workflow runs this script and uploads
  the resulting backup files to both GitHub Artifacts and S3.

- **`run-migration.sh`** - Runs database migrations
  ```bash
  ./scripts/run-migration.sh
  ```

## Why JavaScript vs TypeScript for Scripts

These utility scripts are written in JavaScript (.js) rather than TypeScript (.ts) for several reasons:

1. **Direct Execution**: JavaScript files can be run directly with Node.js without a compilation step
2. **Simplicity**: For utility scripts, we don't necessarily need the type safety of TypeScript
3. **Portability**: JavaScript scripts have fewer dependencies and are easier to run in different environments
4. **Maintenance**: Scripts are generally simpler and change less frequently than application code

## Adding New Scripts

When adding new scripts:

1. Always place them in the `scripts` directory, not in the project root
2. Make executable scripts with `chmod +x scripts/your-script.js`
3. Add a description in this README
4. Consider adding an npm script in `package.json` for frequently used scripts 