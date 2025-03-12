import { execSync } from 'child_process';
import * as Sentry from '@sentry/node';

interface ReleaseOptions {
  version: string;
  projects: string[];
  environment: string;
}

/**
 * Creates a new Sentry release with source maps and commit data
 * @param options Release configuration options
 */
async function createSentryRelease(options: ReleaseOptions): Promise<void> {
  const { version, projects, environment } = options;

  try {
    // Validate required environment variables
    if (!process.env.SENTRY_AUTH_TOKEN) {
      throw new Error('SENTRY_AUTH_TOKEN environment variable is required');
    }

    // Initialize Sentry with minimal config
    Sentry.init({
      environment,
      enabled: true,
    });

    // Get the current git commit hash
    const commitHash = execSync('git rev-parse HEAD').toString().trim();

    // Create release using Sentry CLI
    execSync(`npx @sentry/cli releases new ${version}`, { stdio: 'inherit' });

    // Set commits for the release
    execSync(`npx @sentry/cli releases set-commits ${version} --commit "antonio59/aafairshare@${commitHash}"`, { stdio: 'inherit' });

    // Associate release with projects
    for (const project of projects) {
      execSync(`npx @sentry/cli releases deploys ${version} new -e ${environment} -p ${project}`, { stdio: 'inherit' });
    }

    console.log(`✅ Successfully created Sentry release ${version}`);
    console.log(`   Environment: ${environment}`);
    console.log(`   Commit: ${commitHash}`);
    console.log(`   Projects: ${projects.join(', ')}`);

  } catch (error) {
    console.error('❌ Failed to create Sentry release:', error);
    process.exit(1);
  }
}

// Get the current package version
const packageVersion = process.env.npm_package_version || '1.0.0';

// Create the release
createSentryRelease({
  version: `v${packageVersion}`,
  projects: ['aafairshare-web', 'aafairshare-functions'],
  environment: process.env.NODE_ENV || 'production',
}).catch(console.error);
