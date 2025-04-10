import fs from 'fs';
import path from 'path';

// Create the assets directory in public if it doesn't exist
const publicAssetsDir = path.join(process.cwd(), 'public', 'assets');
if (!fs.existsSync(publicAssetsDir)) {
  fs.mkdirSync(publicAssetsDir, { recursive: true });
}

// Copy all files from build/client/assets to public/assets
const buildAssetsDir = path.join(process.cwd(), 'build', 'client', 'assets');
if (fs.existsSync(buildAssetsDir)) {
  const files = fs.readdirSync(buildAssetsDir);

  files.forEach(file => {
    const sourcePath = path.join(buildAssetsDir, file);
    const destPath = path.join(publicAssetsDir, file);

    // Only copy if it's a file (not a directory)
    if (fs.statSync(sourcePath).isFile()) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied ${file} to public/assets`);
    }
  });

  console.log('All assets copied successfully!');
} else {
  console.error('Build assets directory does not exist!');
  process.exit(1);
}
