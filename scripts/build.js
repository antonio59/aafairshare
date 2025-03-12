import { execSync } from 'child_process';

async function runCommand(command, ignoreError = false) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { 
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' }
    });
    return true;
  } catch (error) {
    if (!ignoreError) {
      console.error(`Failed to run command: ${command}`);
      console.error(error);
      process.exit(1);
    }
    return false;
  }
}

async function main() {
  // Build the application
  await runCommand('vite build');

  // Skip Sentry in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Skipping Sentry release in development');
    return;
  }

  // Set release version
  const version = process.env.VERCEL_GIT_COMMIT_SHA || 
                 execSync('git rev-parse HEAD').toString().trim();
  
  process.env.SENTRY_RELEASE = version;
  console.log(`Creating Sentry release: ${version}`);

  try {
    // Create release
    await runCommand(`./node_modules/.bin/sentry-cli releases new "${version}"`);

    // Associate commits (ignore errors)
    await runCommand(
      `./node_modules/.bin/sentry-cli releases set-commits "${version}" --commit "${process.env.SENTRY_ORG}/${process.env.SENTRY_PROJECT}@${version}"`,
      true
    );

    // Upload source maps
    await runCommand(`./node_modules/.bin/sentry-cli sourcemaps inject ./dist`);
    await runCommand(`./node_modules/.bin/sentry-cli sourcemaps upload ./dist --release="${version}"`);

    // Finalize release
    await runCommand(`./node_modules/.bin/sentry-cli releases finalize "${version}"`);

    console.log('✅ Build and Sentry release completed successfully!');
  } catch (error) {
    console.error('Failed to create Sentry release:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 