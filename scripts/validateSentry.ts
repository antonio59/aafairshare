import { execSync } from 'child_process';

async function validateSentryAccess() {
  try {
    // Validate required environment variables
    const requiredVars = ['SENTRY_AUTH_TOKEN', 'SENTRY_ORG', 'SENTRY_PROJECT'];
    const missing = requiredVars.filter(name => !process.env[name]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Test Sentry project access using sentry-cli
    execSync('./node_modules/.bin/sentry-cli projects list', {
      stdio: 'inherit',
      env: {
        ...process.env,
        SENTRY_LOG_LEVEL: 'debug'
      }
    });

    console.log('✅ Sentry project access validated successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to validate Sentry project access:', error);
    process.exit(1);
  }
}

validateSentryAccess().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});