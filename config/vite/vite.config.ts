/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

const rootDir = path.resolve(__dirname, '../..');

// Config file paths
const POSTCSS_CONFIG_PATH = path.resolve(__dirname, '../postcss/postcss.config.ts');
const TAILWIND_CONFIG_PATH = path.resolve(__dirname, '../tailwind/tailwind.config.ts');
// Tailwind config should be referenced in postcss.config.ts

// https://vitejs.dev/config/
export default defineConfig({
  root: rootDir,
  plugins: [
    react(),
    tsconfigPaths()
  ],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
      '@core': path.resolve(rootDir, 'src/core'),
      '@features': path.resolve(rootDir, 'src/features'),
      '@components': path.resolve(rootDir, 'src/components'),
      '@lib': path.resolve(rootDir, 'src/lib'),
      '@utils': path.resolve(rootDir, 'src/utils'),
      '@hooks': path.resolve(rootDir, 'src/hooks'),
      '@config': path.resolve(rootDir, 'config')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(rootDir, 'index.html')
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    fs: {
      strict: false,
      allow: ['..']
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  },
  define: {
    'process.env': {}
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js']
  },
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.[tj]sx?$/,
    exclude: []
  },
  worker: {
    format: 'es'
  }
});