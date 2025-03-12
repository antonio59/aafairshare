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
    react({
      include: '**/*.{jsx,tsx}',
      babel: {
        plugins: ['@babel/plugin-transform-react-jsx']
      }
    }),
    tsconfigPaths({
      projects: [path.resolve(rootDir, 'tsconfig.json')]
    })
  ],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(rootDir, 'src') },
      { find: '@features', replacement: path.resolve(rootDir, 'src/features') },
      { find: '@core', replacement: path.resolve(rootDir, 'src/core') },
      { find: '@components', replacement: path.resolve(rootDir, 'src/components') },
      { find: '@lib', replacement: path.resolve(rootDir, 'src/lib') },
      { find: '@utils', replacement: path.resolve(rootDir, 'src/utils') },
      { find: '@hooks', replacement: path.resolve(rootDir, 'src/hooks') },
      { find: '@config', replacement: path.resolve(rootDir, 'config') }
    ],
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  },
  build: {
    outDir: path.resolve(rootDir, 'dist'),
    sourcemap: true,
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      input: path.resolve(rootDir, 'index.html'),
      external: [],
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('@supabase')) return 'supabase-vendor';
            return 'vendor';
          }
          if (id.includes('.worker.')) return 'workers';
          if (id.includes('features/')) return 'features';
          if (id.includes('core/')) return 'core';
          return null;
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production'
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
    include: ['@supabase/supabase-js'],
    exclude: [],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        {
          name: 'node-globals',
          setup(build) {
            build.onResolve({ filter: /^(stream|util|events|crypto|fs|path|buffer)$/ }, args => {
              return { path: args.path, namespace: 'node-globals' };
            });
            build.onLoad({ filter: /.*/, namespace: 'node-globals' }, () => {
              return { contents: 'export default {}' };
            });
          }
        }
      ]
    }
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