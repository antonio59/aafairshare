import type { AcceptedPlugin } from 'postcss';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define tailwind config path relative to this file
const TAILWIND_CONFIG_PATH = path.join(__dirname, 'tailwind.config.ts');

interface PostCSSConfig {
  plugins: {
    [key: string]: AcceptedPlugin | Record<string, any>;
  };
}

const config: PostCSSConfig = {
  plugins: {
    'tailwindcss/nesting': {},
    tailwindcss: { config: TAILWIND_CONFIG_PATH },
    autoprefixer: {},
  },
};

export default config; 