import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define tailwind config path relative to this file
const TAILWIND_CONFIG_PATH = path.join(__dirname, 'tailwind.config.ts');

export default {
  plugins: {
    tailwindcss: {
      config: path.join(__dirname, 'tailwind.config.ts')
    },
    autoprefixer: {}
  }
} 