import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

interface DirectoryConfig {
  path: string;
  description: string;
}

interface PlaceholderFile {
  path: string;
  content: string;
}

interface NetlifyUtils {
  build: {
    failBuild: (msg: string) => void;
    failPlugin: (msg: string) => void;
  };
  status: {
    show: (msg: string) => void;
  };
}

interface NetlifyPluginContext {
  utils: NetlifyUtils;
}

const directories: DirectoryConfig[] = [
  { path: 'dist', description: 'Build output directory' },
  { path: 'netlify/functions-dist', description: 'Netlify Functions build directory' },
  { path: 'playwright-report', description: 'Playwright test reports' },
  { path: 'test-results', description: 'Test results directory' }
];

const placeholderFiles: PlaceholderFile[] = [
  {
    path: 'playwright-report/index.html',
    content: '<html><body><h1>Tests skipped</h1></body></html>'
  },
  {
    path: 'test-results/results.json',
    content: JSON.stringify({ 
      skipped: true, 
      timestamp: new Date().toISOString() 
    })
  }
];

async function ensureDirectory(dir: DirectoryConfig): Promise<boolean> {
  try {
    const fullPath = join(process.cwd(), dir.path);
    
    if (!existsSync(fullPath)) {
      await mkdir(fullPath, { recursive: true });
      console.log(`✅ Created ${dir.path} (${dir.description})`);
      return true;
    }
    
    console.log(`ℹ️ ${dir.path} already exists`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating ${dir.path}:`,
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
}

async function createPlaceholderFile(file: PlaceholderFile): Promise<void> {
  const fullPath = join(process.cwd(), file.path);
  
  if (!existsSync(fullPath)) {
    await writeFile(fullPath, file.content, 'utf-8');
    console.log(`✅ Created placeholder file: ${file.path}`);
  }
}

export const onPreBuild = async ({ utils }: NetlifyPluginContext): Promise<void> => {
  console.log('\n🔧 Setting up required directories...\n');
  
  try {
    // Create all directories in parallel
    const results = await Promise.all(
      directories.map(dir => ensureDirectory(dir))
    );
    
    // Check if any directory creation failed
    if (results.includes(false)) {
      utils.build.failPlugin('Failed to create one or more required directories');
      return;
    }
    
    // Create placeholder files
    await Promise.all(
      placeholderFiles.map(file => createPlaceholderFile(file))
    );
    
    console.log('\n✨ Directory setup completed successfully\n');
  } catch (error) {
    utils.build.failBuild(
      `Failed to set up directories: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
