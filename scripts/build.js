#!/usr/bin/env node

/**
 * Custom build script to handle Firebase resolution issues
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.cyan}Starting custom build process...${colors.reset}`);

try {
  // Step 1: Run the Vite build with Firebase externalized
  console.log(`\n${colors.yellow}Step 1: Running Vite build...${colors.reset}`);

  // Set environment variable to tell Vite to externalize Firebase
  process.env.VITE_EXTERNALIZE_FIREBASE = 'true';

  // Run the build command
  execSync('vite build', { stdio: 'inherit' });

  console.log(`${colors.green}✓ Build completed successfully${colors.reset}`);

  // Step 2: Copy public files to dist
  console.log(`\n${colors.yellow}Step 2: Copying public files...${colors.reset}`);

  const publicDir = path.resolve(__dirname, '..', 'public');
  const distDir = path.resolve(__dirname, '..', 'dist');

  // Create icons directory if it doesn't exist
  const iconsDistDir = path.resolve(distDir, 'icons');
  if (!fs.existsSync(iconsDistDir)) {
    fs.mkdirSync(iconsDistDir, { recursive: true });
  }

  // Copy icons
  const iconsDir = path.resolve(publicDir, 'icons');
  if (fs.existsSync(iconsDir)) {
    const iconFiles = fs.readdirSync(iconsDir);
    for (const file of iconFiles) {
      const srcPath = path.resolve(iconsDir, file);
      const destPath = path.resolve(iconsDistDir, file);
      fs.copyFileSync(srcPath, destPath);
      console.log(`✅ Copied ${file}`);
    }
  }

  // Copy individual files
  const filesToCopy = [
    'apple-touch-icon.png',
    'favicon.svg',
    'manifest.json',
    'service-worker.js'
  ];

  for (const file of filesToCopy) {
    const srcPath = path.resolve(publicDir, file);
    const destPath = path.resolve(distDir, file);
    if (fs.existsSync(srcPath)) {
      try {
        // Special handling for manifest.json
        if (file === 'manifest.json') {
          // Read the manifest file
          const content = fs.readFileSync(srcPath, 'utf8');
          // Parse and validate JSON
          const manifestData = JSON.parse(content);
          // Write the validated JSON with proper formatting
          fs.writeFileSync(destPath, JSON.stringify(manifestData, null, 2));
          console.log(`✅ Validated and wrote ${file}`);
        } else {
          // Normal file copy for non-manifest files
          fs.copyFileSync(srcPath, destPath);
          console.log(`✅ Copied ${file}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error);
      }
    } else {
      console.warn(`⚠️ File not found: ${srcPath}`);
    }
  }

  console.log(`${colors.green}✓ Public files copied to dist directory${colors.reset}`);

  console.log(`\n${colors.bright}${colors.green}Build completed successfully!${colors.reset}`);

} catch (error) {
  console.error(`\n${colors.red}Build failed:${colors.reset}`, error);
  process.exit(1);
}
