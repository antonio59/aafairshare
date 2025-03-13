/// <reference types="vite/client" />

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import tsconfigPaths from 'vite-tsconfig-paths';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const configDir = path.resolve(__dirname, '..');

// Config file paths
const POSTCSS_CONFIG_PATH = path.resolve(configDir, 'postcss.config.ts');

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    root: rootDir,
    plugins: [
      react(),
      tsconfigPaths()
    ],
    css: {
      postcss: path.resolve(rootDir, 'postcss.config.cjs'),
      devSourcemap: true
    },
    resolve: {
      alias: {
        '@': path.resolve(rootDir, 'src'),
        '@features': path.resolve(rootDir, 'src/features'),
        '@core': path.resolve(rootDir, 'src/core'),
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
      cssCodeSplit: false,
      rollupOptions: {
        input: {
          main: path.resolve(rootDir, 'index.html')
        },
        output: {
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'index.css') return 'assets/index.css';
            return 'assets/[name]-[hash][extname]';
          },
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
      // Expose env variables to the client
      'process.env': env
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
  };
});