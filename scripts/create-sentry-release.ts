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
 * @param command - Command to execute
 * @returns Result of command execution
 */
function executeCommand(command: string): CommandResult {
  try {
    const output = execSync(command, { stdio: 'inherit' });
    return {
      success: true,
      message: output?.toString() || 'Command executed successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Command execution failed',
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}

/**
 * Creates a new Sentry release with source maps and commit data
 * @param options Release configuration options
 */
/**
 * Create a new Sentry release with source maps and commit data
 * @param options - Release configuration options
 */
async function createSentryRelease(options: ReleaseOptions): Promise<void> {
  const { version, projectSlugs, environment } = options;

  try {
    // Validate Sentry configuration
    if (!sentryAuthConfig.authToken) {
      throw new Error('Sentry auth token is required. Set SENTRY_AUTH_TOKEN environment variable.');
    }

    // Initialize Sentry with our configuration
    Sentry.init({
      ...sentryConfig,
      environment,
      enabled: true,
    });

    // Get the current git commit hash
    const getCommitResult = executeCommand('git rev-parse HEAD');
    if (!getCommitResult.success) {
      throw new Error('Failed to get git commit hash');
    }
    const commitHash = getCommitResult.message.trim();

    // Create release using Sentry CLI
    const createReleaseResult = executeCommand(`npx @sentry/cli releases new ${version} -p 4508958681661520`);
    if (!createReleaseResult.success) {
      throw new Error('Failed to create Sentry release');
    }

    // Set commits for the release
    const setCommitsResult = executeCommand(
      `npx @sentry/cli releases set-commits ${version} --commit "antonio59/aafairshare@${commitHash}"`
    );
    if (!setCommitsResult.success) {
      throw new Error('Failed to set commits for release');
    }

    // Associate release with projects
    const deployResults = await Promise.all(
      projectSlugs.map(() =>
        executeCommand(`npx @sentry/cli releases deploys ${version} new -e ${environment} -p 4508958681661520`)
      )
    );

    const failedDeploys = deployResults.filter(result => !result.success);
    if (failedDeploys.length > 0) {
      throw new Error(`Failed to deploy release to ${failedDeploys.length} projects`);
    }

    console.log(`✅ Successfully created Sentry release ${version}`);
    console.log(`   Environment: ${environment}`);
    console.log(`   Commit: ${commitHash}`);
    console.log(`   Projects: ${projectSlugs.join(', ')}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Failed to create Sentry release:', errorMessage);
    process.exit(1);
  }
}

// Get the current package version
const packageVersion = process.env.npm_package_version || '1.0.0';

// Create the release
createSentryRelease({
  version: `v${packageVersion}`,
  projectSlugs: ['aafairshare'],
  environment: process.env.NODE_ENV || 'production',
}).catch(console.error);
