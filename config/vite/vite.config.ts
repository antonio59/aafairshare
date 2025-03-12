/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const rootDir = path.resolve(__dirname, '../..');

// Config file paths
const POSTCSS_CONFIG_PATH = path.resolve(rootDir, 'config/postcss.config.ts');

// https://vitejs.dev/config/
export default defineConfig({
  root: rootDir,
  plugins: [react()],
  css: {
    postcss: POSTCSS_CONFIG_PATH,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        main: path.resolve(rootDir, 'index.html')
      },
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
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