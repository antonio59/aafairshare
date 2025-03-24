# Household Expenses Management App

A modern, mobile-first application for managing household expenses between two users with comprehensive analytics and settlement tracking.

## Features

- 🔐 **User Authentication**: Secure login system with protected routes
- 💸 **Expense Tracking**: Add, edit, and delete expenses with categories and locations
- 📊 **Analytics Dashboard**: Visualize spending patterns with charts and graphs
- 💼 **Settlement System**: Track who owes whom with automatic calculations
- 📱 **Mobile-First Design**: Responsive UI that works on all devices
- 📤 **Export Functionality**: Export expense data to CSV, XLSX, or PDF

## Development

### Prerequisites

- Node.js 18+ and npm

### Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/household-expenses.git
   cd household-expenses
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to http://localhost:5000

### Project Structure

- `/client`: Frontend React application
- `/server`: Backend Express API
- `/shared`: Shared types and schemas
- `/.github`: GitHub Actions workflows and configuration

## Automated Workflows

This project uses GitHub Actions for CI/CD and other automated tasks:

### 1. Continuous Integration (CI)

- **Workflow file**: `.github/workflows/ci.yml`
- **Trigger**: On push to main branch or pull requests
- **Functions**: 
  - Linting with ESLint
  - TypeScript type checking

### 2. Security Scanning with Snyk

- **Workflow file**: `.github/workflows/snyk-security.yml`
- **Trigger**: On push to main, pull requests, or weekly schedule
- **Functions**: 
  - Scans for vulnerabilities in dependencies
  - Alerts on high-severity issues

### 3. CodeQL Analysis

- **Workflow file**: `.github/workflows/codeql-analysis.yml`
- **Trigger**: On push to main, pull requests, or weekly schedule
- **Functions**: 
  - Static code analysis for security vulnerabilities
  - Detects common coding errors

### 4. Automated Deployment

- **Workflow file**: `.github/workflows/deploy.yml`
- **Trigger**: On push to main or manual trigger
- **Functions**: 
  - Builds the application
  - Deploys to the hosting environment

### 5. Dependabot

- **Configuration file**: `.github/dependabot.yml`
- **Functions**: 
  - Automatically creates PRs for outdated dependencies
  - Checks for updates to GitHub Actions workflows

## Security Secrets

For GitHub Actions to work properly, the following secrets need to be configured:

1. `SNYK_TOKEN`: API token for Snyk security scanning
2. Deployment-specific secrets (depending on your hosting provider)

## Maintenance Tasks

### Updating Dependencies

Dependencies are automatically monitored by Dependabot, which creates pull requests for outdated packages. Review these PRs and merge them as needed.

### Security Vulnerabilities

1. Snyk scans run weekly to detect vulnerabilities
2. CodeQL analysis runs to detect security issues in code
3. Address all high-priority security alerts promptly

### Deployment

Deployment is automated via GitHub Actions when changes are pushed to the main branch. You can also trigger a manual deployment from the Actions tab in GitHub.

## License

[MIT License](LICENSE)