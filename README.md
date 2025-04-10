# Household Expenses Management App

A modern, mobile-first application for managing household expenses between two users with comprehensive analytics and settlement tracking.

> **Note:** This project has been migrated from Vite to Remix. The new Remix implementation is located in the `aafairshare-remix` directory.

## Features

- 🔐 **User Authentication**: Secure login system with protected routes
- 💸 **Expense Tracking**: Add, edit, and delete expenses with categories and locations
- 📊 **Analytics Dashboard**: Visualize spending patterns with tables and summaries
- 💼 **Settlement System**: Track who owes whom with automatic calculations
- 📱 **Mobile-First Design**: Responsive UI that works on all devices
- 📤 **Export Functionality**: Export expense data to CSV, XLSX, or PDF
- 🔄 **Recurring Expenses**: Set up and manage recurring expenses
- 🌙 **Dark Mode Support**: Toggle between light and dark themes

## Development

### Prerequisites

- Node.js 18+ and npm
- Tailwind CSS v3.4.x (see [CSS Framework](#css-framework) section for details)

### Getting Started

#### Method 1: Direct Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/AAFairShare.git
   cd AAFairShare/aafairshare-remix
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to http://localhost:5173

#### Method 2: Using Docker

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/AAFairShare.git
   cd AAFairShare
   ```

2. Build and run with Docker Compose:
   ```
   docker-compose up --build
   ```

3. Open your browser and navigate to http://localhost:5000

#### Method 3: Using Pre-built Docker Image

1. Pull the Docker image from GitHub Container Registry:
   ```
   docker pull ghcr.io/yourusername/aafairshare:latest
   ```

2. Run the container:
   ```
   docker run -p 5000:5000 ghcr.io/yourusername/aafairshare:latest
   ```

3. Open your browser and navigate to http://localhost:5000

### Project Structure

- `/aafairshare-remix`: Frontend Remix application (current implementation)
- `/client-backup`: Legacy Vite implementation (kept for reference)
- `/functions`: Backend Cloud Functions
- `/shared`: Shared types and schemas
- `/.github`: GitHub Actions workflows and configuration
- `/docs`: Project documentation and technical decisions

### Cloud Functions Deployment

Due to the project structure and TypeScript path aliases, deploying the Cloud Functions requires a specific manual build step before running the Firebase deployment command. The standard Firebase `predeploy` hooks may not correctly build the functions in this setup.

**Ensure `firebase.json` does NOT run the build command in `predeploy`.** The `predeploy` array for functions should ideally only contain linting steps, or be empty:
```json
// firebase.json
...
"functions": [
  {
    "source": "functions",
    "codebase": "default",
    "ignore": [...],
    "predeploy": [
      // "npm --prefix \"$RESOURCE_DIR\" run build" // <-- Ensure this line is removed or commented out
      "npm --prefix \"$RESOURCE_DIR\" run lint"
    ]
  }
],
...
```

**Deployment Steps:**

1.  **Install/Update Function Dependencies:**
    ```bash
    cd functions
    npm install
    ```

2.  **Manually Build Functions:** This step compiles the TypeScript code and adjusts the output directory structure.
    ```bash
    # Still inside the 'functions' directory
    npm run build
    ```

3.  **Deploy from Project Root:** Navigate back to the project root directory and run the Firebase deploy command.
    ```bash
    cd ..
    firebase deploy --only functions
    ```

## CSS Framework

### Tailwind CSS

This project uses Tailwind CSS v3 for styling. We've tested Tailwind CSS v4 (beta) but encountered compatibility issues with our current setup.

#### Tailwind CSS v3 Implementation

The project is currently configured to use Tailwind CSS v3.4.x, which provides stable functionality and good compatibility with our development environment. Key features we're using include:

1. **Custom Color Scheme**: We use CSS variables for theming, defined in `client/src/index.css`
2. **Typography Plugin**: We use `@tailwindcss/typography` for rich text formatting
3. **Border Styling**: We consistently use `border-gray-200` for card and table borders
4. **Responsive Design**: Mobile-first approach with responsive breakpoints

#### Tailwind CSS v4 Compatibility Issues

We've attempted to upgrade to Tailwind CSS v4 (beta) but encountered several issues:

1. **PostCSS Configuration**: The v4 PostCSS plugin (`@tailwindcss/postcss`) requires different configuration that conflicts with our current setup.
2. **CSS Directives**: The v4 directives and configuration approach differ significantly from v3.
3. **Plugin Compatibility**: Some plugins we use haven't been updated for v4 compatibility yet.
4. **Build Performance**: We experienced slower build times with the v4 beta.

We plan to revisit the upgrade when Tailwind CSS v4 reaches a stable release.

### Attempting Tailwind CSS v4 Upgrade

If you want to experiment with Tailwind CSS v4, follow these steps with caution:

1. **Update dependencies**:
   ```bash
   npm install tailwindcss@latest @tailwindcss/postcss @tailwindcss/oxide-darwin-arm64
   ```

2. **Update PostCSS configuration** (postcss.config.cjs):
   ```js
   module.exports = {
     plugins: {
       '@tailwindcss/postcss': {},
       'autoprefixer': {}
     }
   }
   ```

3. **Update CSS imports** (index.css):
   ```css
   @import "tailwindcss";
   @config "../../tailwind.config.ts";
   ```

**Note**: This configuration may not work as expected due to the beta status of Tailwind CSS v4.

## Troubleshooting

### Build Failures on macOS ARM64 (Apple Silicon) with Tailwind CSS

**Issue:**

The build process (`npm run build`) may fail with errors related to missing native modules, such as:

-   `Cannot find module '../lightningcss.darwin-arm64.node'`
-   `Cannot find module '@tailwindcss/oxide-darwin-arm64'`

This occurs because `npm` sometimes fails to automatically download and install the optional native dependencies required by Tailwind CSS (and its underlying engine, Lightning CSS) for the macOS ARM64 architecture.

**Solution:**

Explicitly install the required optional dependencies for your platform:

```bash
npm install lightningcss-darwin-arm64@<version> --save-dev
```

If using Tailwind CSS v4:
```bash
npm install @tailwindcss/oxide-darwin-arm64@<version> --save-dev
```

Replace `<version>` with the specific version matching your installed packages (check `package.json`). For example:

```bash
npm install lightningcss-darwin-arm64@1.29.2 --save-dev
npm install @tailwindcss/oxide-darwin-arm64@4.1.3 --save-dev
```

After installing these packages, the `npm run build` command should succeed.

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

### 5. Docker Image Build and Push

- **Workflow file**: `.github/workflows/docker.yml`
- **Trigger**: On push to main branch or tags, and pull requests
- **Functions**:
  - Builds Docker image using the Dockerfile
  - Pushes to GitHub Container Registry (ghcr.io)
  - Tags images with semantic versioning and git SHA

### 6. Issue Triage

- **Workflow file**: `.github/workflows/issue-triage.yml`
- **Trigger**: When issues are opened or reopened
- **Functions**:
  - Automatically adds "needs-triage" label
  - Adds a welcome comment for the issue creator

### 7. Dependabot

- **Configuration file**: `.github/dependabot.yml`
- **Functions**:
  - Automatically creates PRs for outdated dependencies
  - Checks for updates to GitHub Actions workflows

## Security Secrets

For GitHub Actions to work properly, the following secrets need to be configured:

1. `SNYK_TOKEN`: API token for Snyk security scanning
2. Deployment-specific secrets (depending on your hosting provider)

## Documentation

The project includes documentation in the `/docs` directory:

- [Project Documentation](docs/README.md) - Overview of all documentation
- [Chart Library Removal](docs/chart-removal.md) - Explanation of why chart libraries were removed from the Analytics page

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
