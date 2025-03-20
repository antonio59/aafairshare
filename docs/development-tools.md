# Development Tools and Scripts

This document provides information about the development tools and utility scripts available in the Expense Sharing App.

## Scripts Directory

The `scripts/` directory contains utility scripts used for development, maintenance, and operational tasks. These scripts are organized separately from the application code to keep the project root clean and make utility scripts easier to find and manage.

### Available Scripts

#### Code Quality and Linting

- **TypeScript Fixes**
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

- **Spell Checking**
  ```bash
  # Run spell checker on all relevant files
  npm run lint:spell
  
  # Run complete linting (TypeScript + spell checking)
  npm run lint
  ```

  The spell checker is configured in `cspell.json` and includes:
  - Technical terms dictionary for our stack
  - Framework-specific terms (Next.js, React, TypeScript)
  - UI component terms (Shadcn, Radix, Headless UI)
  - Database and API terms (Supabase)
  - Custom regex patterns for technical naming

  To add new technical terms:
  1. Open `cspell.json`
  2. Add the term to the `words` array
  3. Run `npm run lint:spell` to verify

#### Database Scripts

- **`run-migration.sh`** - Executes database migrations
  ```bash
  ./scripts/run-migration.sh
  ```

#### Supabase TypeScript Type Generation

- **`gen:types`** - Generates TypeScript types from the Supabase database schema
  ```bash
  npm run gen:types
  ```

  This command uses the Supabase CLI to generate TypeScript type definitions that match your database schema. The generated types are saved to `src/core/types/supabase.types.ts`.

  **When to run this command:**
  - After making changes to your database schema
  - After running migrations
  - Before committing code that interacts with modified database tables

  **CI/CD Integration:**
  
  The type generation is integrated into the CI/CD pipeline to ensure type definitions always stay in sync with the database schema. This is handled in our GitHub Actions workflows.

  The workflow:
  1. Generates the latest types from the production database
  2. Compares with existing types in the repository
  3. If differences exist, creates a commit with updated types
  4. Includes these updated types in the deployment process

  This ensures that all deployed code uses accurate and up-to-date types that match the actual database structure.

  **Manual type checking:**
  
  Before starting development work that interacts with the database, it's recommended to run:
  ```bash
  npm run gen:types && npm run typecheck
  ```
  
  This will generate the latest types and verify your code is compatible with the current database schema.

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

```

For a complete list of available npm scripts, refer to the `scripts` section in `package.json`.

## GitHub Actions Workflows

The project uses GitHub Actions for automation of various tasks. These workflows are defined in the `.github/workflows/` directory.