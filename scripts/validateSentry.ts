import { execSync } from 'child_process';

function validateEnvironment() {
  const requiredVars = [
    'SENTRY_AUTH_TOKEN',
    'SENTRY_ORG',
    'SENTRY_PROJECT',
    'VITE_SENTRY_DSN',
    'VITE_APP_VERSION'
  ];

  console.log('Validating Sentry environment variables...');
  
  const missing = requiredVars.filter(name => {
    const value = process.env[name];
    if (!value) {
      console.error(`❌ Missing ${name}`);
      return true;
    }
    console.log(`✓ ${name} is set`);
    return false;
  });

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

function validateSentryAccess() {
  console.log('\nValidating Sentry CLI access...');
  
  try {
    // Test auth token
    console.log('Testing authentication...');
    execSync('./node_modules/.bin/sentry-cli info', {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, SENTRY_LOG_LEVEL: 'debug' }
    });
    console.log('✓ Authentication successful');

    // Test project access
    console.log('\nTesting project access...');
    execSync('./node_modules/.bin/sentry-cli projects list', {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, SENTRY_LOG_LEVEL: 'debug' }
    });
    console.log('✓ Project access verified');

  } catch (error) {
    console.error('\n❌ Sentry CLI validation failed:');
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

try {
  validateEnvironment();
  validateSentryAccess();
  console.log('\n✅ All Sentry validations passed!');
} catch (error) {
  console.error('\n❌ Validation failed:');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}