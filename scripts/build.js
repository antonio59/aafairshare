import { execSync } from 'child_process';

try {
  console.log('Building application...');
  execSync('vite build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('Failed to build:', error);
  process.exit(1);
} 