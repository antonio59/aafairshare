# Netlify Configuration

This directory contains Netlify-specific configurations and functions for the project.

## TypeScript Support

This project uses TypeScript for Netlify functions and build plugins. The TypeScript files are compiled to JavaScript during the build process using a specific TypeScript configuration (`tsconfig.netlify.json`).

### Configuration Files

- `tsconfig.netlify.json`: TypeScript configuration for Netlify functions and plugins
- `netlify.toml`: Main Netlify configuration file
- `.nvmrc` and `.node-version`: Node.js version specification files

## Preventing Duplicate Builds

One of the key issues we address is preventing duplicate builds on Netlify. By default, Netlify can trigger multiple builds for the same commit:

1. One build for the generic reference (`main@HEAD`)
2. Another build for the specific commit hash (e.g., `main@abc123d`)

### Solution: Custom Build Plugin

We've implemented a TypeScript build plugin (`netlify-build-plugin.ts`) that:

1. Logs details about the current build environment
2. Warns about potentially redundant HEAD builds
3. Allows branch-specific builds to proceed normally

### How It Works

The build process follows these steps:

1. The TypeScript files are compiled using `tsc -p tsconfig.netlify.json`
2. The compiled JavaScript files are placed in `netlify/functions-dist`
3. Netlify uses the compiled build plugin to monitor and control builds

### Stop Duplicate Builds Function

In addition to the build plugin, we've created a Netlify function (`stop-duplicate-builds.ts`) that serves as a webhook handler for build events. This function:

1. Analyzes incoming build triggers
2. Cancels generic HEAD builds when more specific commit builds are expected
3. Allows manual deployments, CLI-triggered builds, and branch-specific builds to proceed

## Environment Variables

The following environment variables are used for build configuration:

- `SKIP_NODE_CHECK`: Set to "true" to bypass Node.js version checking
- `NODE_VERSION`: Specifies the Node.js version for Netlify
- `NPM_FLAGS`: Additional flags for npm installation

## CI Build Process

We've implemented a robust CI build process for Netlify with improved error handling and conditional execution of steps. The build process includes:

1. **CI-specific Build Scripts**: Scripts in the `scripts/` directory handle the build process with detailed logging and error recovery.
2. **Non-blocking Tests**: Tests are run conditionally and don't block deployments if they fail.
3. **Artifact Management**: Empty directories are created for required artifacts if they don't exist.
4. **Environment Variable Control**: Features can be toggled with environment variables:
   - `SKIP_TESTS`: Set to "true" to skip running tests (default in production)
   - `SKIP_SENTRY`: Set to "true" to skip Sentry release creation (default in production)
   - `SKIP_PLAYWRIGHT`: Set to "true" to skip Playwright browser tests

### Testing the Build Locally

Before pushing changes to Netlify, you can test the build process locally using:

```bash
npm run test:netlify-build
```

This script simulates the Netlify environment and runs the build process, verifying that all required artifacts are generated correctly.

## Troubleshooting

If you encounter issues with builds:

1. Check the Netlify deployment logs
2. Look for warnings from the build plugin
3. Verify that the TypeScript compilation step completed successfully
4. Ensure the Node.js version is compatible (20.x+) 

### Common Build Issues

#### "vite: not found" Error

If you encounter an error like "sh: 1: vite: not found" during the build process, it means that the Vite CLI is not available in the PATH. This has been fixed by:

1. Using `npm ci` instead of just `npm run build` in the Netlify build command to ensure a clean installation
2. Adding node_modules/.bin to the PATH environment variable in netlify.toml
3. Using `npx vite build` in package.json to ensure Vite is found even if it's not in the PATH

If this error persists:
- Check that vite is properly listed in the devDependencies in package.json
- Verify that the Netlify build environment is using the correct Node.js version
- Try clearing the Netlify build cache and rebuilding 