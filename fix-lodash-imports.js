// This script patches the problematic lodash imports in node_modules
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to the problematic files
const symbolsPath = path.resolve(__dirname, 'node_modules/.pnpm/recharts@2.15.2_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/recharts/es6/shape/Symbols.js');
const curvePath = path.resolve(__dirname, 'node_modules/.pnpm/recharts@2.15.2_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/recharts/es6/shape/Curve.js');
const chartUtilsPath = path.resolve(__dirname, 'node_modules/.pnpm/recharts@2.15.2_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/recharts/es6/util/ChartUtils.js');
const dataUtilsPath = path.resolve(__dirname, 'node_modules/.pnpm/recharts@2.15.2_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/recharts/es6/util/DataUtils.js');

// Function to patch a file
function patchFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Replace default imports with named imports
  content = content.replace(/import\s+upperFirst\s+from\s+['"]lodash\/upperFirst['"]/g,
                           "import { upperFirst } from 'lodash'");

  content = content.replace(/import\s+isNaN\s+from\s+['"]lodash\/isNaN['"]/g,
                           "import { isNaN } from 'lodash'");

  content = content.replace(/import\s+flatMap\s+from\s+['"]lodash\/flatMap['"]/g,
                           "import { flatMap } from 'lodash'");
                           
  content = content.replace(/import\s+get\s+from\s+['"]lodash\/get['"]/g,
                           "import { get } from 'lodash'");

  fs.writeFileSync(filePath, content);
  console.log(`Patched: ${filePath}`);
}

// Patch all the files
patchFile(symbolsPath);
patchFile(curvePath);
patchFile(chartUtilsPath);
patchFile(dataUtilsPath); // Add DataUtils.js to the list of files to patch

console.log('All files patched successfully!');
