import { Config } from 'postcss-load-config';
import path from 'path';

// Define tailwind config path relative to this file
const TAILWIND_CONFIG_PATH = path.join(__dirname, 'tailwind.config.ts');

const config: Config = {
  plugins: {
    tailwindcss: { config: TAILWIND_CONFIG_PATH },
    autoprefixer: {},
  },
};

export default config; 