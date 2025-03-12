import { execSync } from 'child_process';
import * as Sentry from '@sentry/node';
import { sentryConfig, sentryAuthConfig } from '../config/sentry/sentry.config';

interface ReleaseOptions {
  version: string;
  projectSlugs: string[];
  environment: string;
}

interface CommandResult {
  success: boolean;
  message: string;
  error?: Error;
}

/**
 * Execute a shell command safely
 */
function executeCommand(command: string): CommandResult {
  try {
    const output = execSync(command, { stdio: 'pipe' });
    return {
      success: true,
      message: output?.toString().trim() || 'Command executed successfully'
    };
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error);
    return {
      success: false,
      message: 'Command execution failed',
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}

/**
 * Create a new Sentry release with source maps and commit data
 */
async function createSentryRelease(options: ReleaseOptions): Promise<void> {
  const { version, projectSlugs, environment } = options;

  try {
    // Validate environment variables
    const requiredEnvVars = {
      'SENTRY_AUTH_TOKEN': process.env.SENTRY_AUTH_TOKEN,
      'SENTRY_ORG': process.env.SENTRY_ORG || sentryAuthConfig.orgSlug,
      'SENTRY_PROJECT': process.env.SENTRY_PROJECT || sentryAuthConfig.projectSlug,
      'VITE_SENTRY_DSN': process.env.VITE_SENTRY_DSN || sentryConfig.dsn
    };

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Initialize Sentry
    Sentry.init({
      ...sentryConfig,
      environment,
      enabled: true,
    });

    // Get git information
    const gitCommit = executeCommand('git rev-parse HEAD');
    if (!gitCommit.success) {
      throw new Error('Failed to get git commit hash');
    }

    const gitBranch = executeCommand('git rev-parse --abbrev-ref HEAD');
    if (!gitBranch.success) {
      throw new Error('Failed to get git branch');
    }

    // Create release
    console.log(`Creating Sentry release ${version}...`);
    const createRelease = executeCommand(`npx @sentry/cli releases new ${version}`);
    if (!createRelease.success) {
      throw new Error('Failed to create Sentry release');
    }

    // Set commits
    console.log('Setting commits...');
    const setCommits = executeCommand(
      `npx @sentry/cli releases set-commits ${version} --commit "${sentryAuthConfig.orgSlug}/${sentryAuthConfig.projectSlug}@${gitCommit.message}"`
    );
    if (!setCommits.success) {
      throw new Error('Failed to set commits');
    }

    // Upload source maps
    console.log('Uploading source maps...');
    const uploadSourcemaps = executeCommand(
      `npx @sentry/cli releases files ${version} upload-sourcemaps ./dist --rewrite`
    );
    if (!uploadSourcemaps.success) {
      throw new Error('Failed to upload source maps');
    }

    // Finalize release
    console.log('Finalizing release...');
    const finalizeRelease = executeCommand(`npx @sentry/cli releases finalize ${version}`);
    if (!finalizeRelease.success) {
      throw new Error('Failed to finalize release');
    }

    // Create deployment
    console.log(`Creating deployment for ${environment}...`);
    const createDeployment = executeCommand(
      `npx @sentry/cli releases deploys ${version} new -e ${environment}`
    );
    if (!createDeployment.success) {
      throw new Error('Failed to create deployment');
    }

    console.log('✅ Sentry release completed successfully:');
    console.log(`   Version: ${version}`);
    console.log(`   Environment: ${environment}`);
    console.log(`   Commit: ${gitCommit.message}`);
    console.log(`   Branch: ${gitBranch.message}`);
    console.log(`   Projects: ${projectSlugs.join(', ')}`);

  } catch (error) {
    console.error('❌ Sentry release creation failed:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Get version and create release
const packageVersion = process.env.npm_package_version || '1.0.0';
const environment = process.env.NODE_ENV || 'production';

createSentryRelease({
  version: `v${packageVersion}`,
  projectSlugs: [sentryAuthConfig.projectSlug],
  environment,
}).catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

const version = process.env.VITE_APP_VERSION || `1.0.0-${Date.now()}`;

// Create a new Sentry release
execSync(`./node_modules/.bin/sentry-cli releases new ${version}`, { stdio: 'inherit' });

// Set commits for the release
try {
  const commit = execSync('git rev-parse HEAD').toString().trim();
  execSync(`./node_modules/.bin/sentry-cli releases set-commits ${version} --commit "antonio59/aafairshare@${commit}"`, { stdio: 'inherit' });
} catch (error) {
  console.warn('Could not set commit for release:', error);
}

// Set the release version for the build
console.log(`::set-output name=SENTRY_RELEASE::${version}`);
