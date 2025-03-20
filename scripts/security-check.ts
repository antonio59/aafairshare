import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const runCommand = (command: string): string => {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error);
    return '';
  }
};

const main = async () => {
  console.log('Running comprehensive security check...');

  // Run npm audit and save results
  console.log('\nRunning npm audit...');
  const auditResult = runCommand('npm audit --json');
  writeFileSync('npm-audit.json', auditResult);

  // Run Snyk security test
  console.log('\nRunning Snyk security test...');
  runCommand('snyk test --sarif-file-output=snyk.sarif');

  // Run Snyk license check
  console.log('\nRunning Snyk license check...');
  runCommand('snyk test --license --sarif-file-output=snyk-license.sarif');

  // Run npm updates check
  console.log('\nChecking for security updates...');
  runCommand('npm audit fix');
  runCommand('npm update --save');

  console.log('\nSecurity check complete. Check npm-audit.json and snyk.sarif files for detailed results.');
};

main().catch(console.error);