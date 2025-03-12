import { execSync } from 'child_process';

async function validateEnvironment() {
  const requiredVars = ['SENTRY_AUTH_TOKEN', 'SENTRY_ORG', 'SENTRY_PROJECT'];
  const missing = requiredVars.filter(name => !process.env[name]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Verify Sentry project access
  try {
    execSync('./node_modules/.bin/sentry-cli projects list', {
      stdio: 'inherit',
      env: {
        ...process.env,
        SENTRY_LOG_LEVEL: 'debug'
      }
    });
  } catch (error) {
    throw new Error('Failed to verify Sentry project access. Please check your credentials and project configuration.');
  }
}

async function createRelease() {
  try {
    validateEnvironment();

    const version = process.env.VITE_APP_VERSION || `1.0.0-${Date.now()}`;
    console.log(`Creating Sentry release ${version}...`);

    // Create a new release
    execSync(`./node_modules/.bin/sentry-cli releases new "${version}"`, { 
      stdio: 'inherit',
      env: {
        ...process.env,
        SENTRY_LOG_LEVEL: 'debug'
      }
    });

    // Associate commits with the release
    try {
      const commit = execSync('git rev-parse HEAD').toString().trim();
      execSync(
        `./node_modules/.bin/sentry-cli releases set-commits "${version}" --commit "${process.env.SENTRY_ORG}/${process.env.SENTRY_PROJECT}@${commit}"`,
        { stdio: 'inherit' }
      );
    } catch (error) {
      console.warn('Warning: Could not associate commits with release:', error);
    }

    // Set the release version for the build
    console.log(`::set-output name=SENTRY_RELEASE::${version}`);
    process.env.SENTRY_RELEASE = version;

  } catch (error) {
    console.error('❌ Failed to create Sentry release:', error);
    process.exit(1);
  }
}

createRelease().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
