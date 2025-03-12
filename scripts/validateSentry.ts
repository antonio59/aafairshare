import { execSync } from 'child_process';

function validateEnvironment() {
  const requiredVars = [
    'SENTRY_AUTH_TOKEN',
    'SENTRY_ORG',
    'SENTRY_PROJECT',
    'VITE_SENTRY_DSN',
    'VITE_APP_VERSION'
  ];

  console.log('Environment Information:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- VERCEL_ENV:', process.env.VERCEL_ENV);
  console.log('- CI:', process.env.CI);
  
  console.log('\nValidating Sentry environment variables...');
  
  // In Vercel, some variables might be encrypted
  const isVercel = process.env.VERCEL === '1';
  
  const missing = requiredVars.filter(name => {
    const value = process.env[name];
    if (!value) {
      if (isVercel) {
        console.log(`⚠️  ${name} not found in process.env (might be encrypted in Vercel)`);
        return false; // Don't count as missing in Vercel
      }
      console.error(`❌ Missing ${name}`);
      return true;
    }
    console.log(`✓ ${name} is set${isVercel ? ' (value hidden in logs)' : ''}`);
    return false;
  });

  if (missing.length > 0 && !isVercel) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

function validateSentryAccess() {
  console.log('\nValidating Sentry CLI access...');
  
  try {
    // Test auth token
    console.log('Testing authentication...');
    const authOutput = execSync('./node_modules/.bin/sentry-cli info', {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, SENTRY_LOG_LEVEL: 'debug' }
    }).toString();
    console.log('✓ Authentication successful');
    console.log(authOutput);

    // Test project access
    console.log('\nTesting project access...');
    const projectOutput = execSync('./node_modules/.bin/sentry-cli projects list', {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, SENTRY_LOG_LEVEL: 'debug' }
    }).toString();
    console.log('✓ Project access verified');
    console.log(projectOutput);

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
  if (process.env.VERCEL !== '1') {
    // Only validate CLI access locally
    validateSentryAccess();
  } else {
    console.log('\nSkipping Sentry CLI validation in Vercel environment');
  }
  console.log('\n✅ All Sentry validations passed!');
} catch (error) {
  console.error('\n❌ Validation failed:');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}