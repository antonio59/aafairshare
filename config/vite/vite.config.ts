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
    alias: [
      { find: '@', replacement: path.resolve(rootDir, 'src') }
    ]
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