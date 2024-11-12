import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression2';
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa';
import fs from 'fs';

// Read manifest.json content
const manifestContent = JSON.parse(fs.readFileSync('./public/manifest.json', 'utf-8'));

// CSP Headers configuration
const cspHeaders = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com https://*.firebase.com https://*.google.com https://*.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline' data: blob: https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: https: https://www.google-analytics.com",
  "connect-src 'self' https://*.firebaseio.com https://*.cloudfunctions.net https://*.googleapis.com https://www.google-analytics.com wss://*.firebaseio.com https://*.github.dev https://glorious-fiesta-9vxxv67qgvfjw9-5173.app.github.dev",
  "frame-src 'self' https://*.firebaseapp.com",
  "manifest-src 'self' https://*.github.dev https://glorious-fiesta-9vxxv67qgvfjw9-5173.app.github.dev",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
  "block-all-mixed-content"
].join('; ');

const pwaOptions: Partial<VitePWAOptions> = {
  strategies: 'generateSW',
  registerType: 'prompt',
  includeAssets: ['offline.html', 'manifest.json'],
  manifest: manifestContent,
  injectRegister: 'auto',
  devOptions: {
    enabled: true,
    type: 'module',
    navigateFallback: 'index.html',
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
    cleanupOutdatedCaches: true,
    sourcemap: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'firebase-cache',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'google-fonts-stylesheets',
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-webfonts',
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images',
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      {
        urlPattern: /\.(?:js|css)$/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-resources',
        },
      },
      {
        urlPattern: /^https:\/\/www\.google-analytics\.com\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'analytics-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24, // 1 day
          },
          networkTimeoutSeconds: 10,
        },
      }
    ],
    navigateFallback: 'offline.html',
    navigateFallbackDenylist: [/^\/api\//],
    skipWaiting: true,
    clientsClaim: true
  }
};

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
      deleteOriginalAssets: false,
    }),
    VitePWA(pwaOptions),
  ],
  
  css: {
    postcss: './postcss.config.js',
    modules: {
      localsConvention: 'camelCase',
    },
    devSourcemap: true,
  },
  
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    headers: {
      'Content-Security-Policy': cspHeaders,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Access-Control-Allow-Origin': 'https://glorious-fiesta-9vxxv67qgvfjw9-5173.app.github.dev',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
    fs: {
      strict: false,
      allow: ['..'],
    },
  },

  build: {
    target: 'esnext',
    modulePreload: true,
    sourcemap: true,
    minify: 'terser',
    cssCodeSplit: true,
    cssMinify: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo: { name?: string }) => {
          const info = assetInfo.name ?? '';
          const extType = info.split('.').at(1) ?? '';
          
          if (/png|jpe?g|svg|gif|tiff|bmp/i.test(extType)) {
            return `assets/img/[name]-[hash][extname]`;
          }
          if (/css/i.test(extType)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        manualChunks: (id: string) => {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('firebase')) return 'firebase-vendor';
            if (id.includes('chart')) return 'chart-vendor';
            if (id.includes('zustand')) return 'zustand-vendor';
            return 'vendor';
          }
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
      },
    },
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'firebase/app', 'firebase/auth', 'firebase/firestore', 'zustand'],
    exclude: ['@jridgewell/sourcemap-codec']
  },

  preview: {
    port: 5173,
    strictPort: true,
    headers: {
      'Content-Security-Policy': cspHeaders,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Access-Control-Allow-Origin': 'https://glorious-fiesta-9vxxv67qgvfjw9-5173.app.github.dev',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  }
});
