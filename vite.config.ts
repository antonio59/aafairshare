import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression2';
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';
import * as esbuild from 'esbuild';
import terser from '@rollup/plugin-terser';

// Read manifest.json content
const manifestContent = JSON.parse(fs.readFileSync('./public/manifest.json', 'utf-8'));

// CSP Headers configuration - with GitHub Codespaces support
const cspHeaders = [
  "default-src 'self' https://*.github.dev https://*.app.github.dev",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.github.dev https://*.app.github.dev",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.github.dev https://*.app.github.dev",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.supabase.co https://*.github.dev https://*.app.github.dev",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.github.dev https://*.app.github.dev https://github.dev",
  "worker-src 'self' blob:",
  "frame-src 'self' https://*.supabase.co https://*.github.dev https://*.app.github.dev",
  "manifest-src 'self' https://*.github.dev https://*.app.github.dev",
].join('; ');

const pwaOptions: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  includeAssets: ['offline.html'],
  manifest: {
    ...manifestContent,
    name: 'AA Fairshare',
    short_name: 'Fairshare',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    start_url: './',
    scope: './',
    id: '/',
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4MB
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'google-fonts-stylesheets'
        }
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
        },
      },
      {
        urlPattern: /\.(?:js|css)$/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'static-resources',
        }
      }
    ],
    navigateFallback: 'index.html',
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true
  },
  devOptions: {
    enabled: true,
    type: 'module',
    navigateFallback: 'index.html',
  }
};

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin', '@babel/plugin-transform-react-jsx']
      }
    }),
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
      deleteOriginalAssets: false,
    }),
    VitePWA(pwaOptions),
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

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
    host: 'localhost',
    origin: 'http://localhost:5173',
    headers: {
      'Content-Security-Policy': cspHeaders,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Permissions-Policy': 'accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), cross-origin-isolated=(), display-capture=(), document-domain=(), encrypted-media=(), execution-while-not-rendered=(), execution-while-out-of-viewport=(), fullscreen=(), geolocation=(), gyroscope=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), navigation-override=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), web-share=(), xr-spatial-tracking=(), clipboard-read=(), clipboard-write=(), gamepad=(), speaker-selection=()'
    },
    fs: {
      strict: true,
      allow: ['.'],
      deny: [
        '.env',
        '.env.*',
        '*.{pem,crt,key}',
        'node_modules/.cache',
        '.git',
        '.github',
        '.vscode',
        'coverage'
      ]
    },
    cors: false,
    hmr: {
      protocol: 'wss',
      host: 'localhost',
      clientPort: 443,
      overlay: false
    },
    watch: {
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**']
    },
    middlewareMode: false
  },

  build: {
    target: 'es2022',
    modulePreload: {
      polyfill: true,
      resolveDependencies: (url: string, deps: string[], { hostId, hostType }: any) => deps
    },
    sourcemap: process.env.NODE_ENV !== 'production',
    minify: 'esbuild',
    cssCodeSplit: true,
    cssMinify: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
    emptyOutDir: true,
    manifest: true,
    ssrManifest: true,
    rollupOptions: {
      plugins: [
        terser({
          format: {
            comments: false
          }
        })
      ],
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
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'zustand-vendor': ['zustand']
        },
        format: 'es',
        generatedCode: {
          constBindings: true,
          objectShorthand: true
        },
        compact: true,
        preserveModules: false,
        strict: true,
        sanitizeFileName: true
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
      }
    },
    commonjsOptions: {
      strictRequires: true,
      transformMixedEsModules: true
    }
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js', 'zustand'],
    exclude: ['@jridgewell/sourcemap-codec'],
    esbuildOptions: {
      target: 'es2022',
      platform: 'browser',
      supported: {
        'dynamic-import': true,
        'import-meta': true
      },
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      },
      minify: true,
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
      treeShaking: true,
      drop: ['debugger', 'console'],
      pure: ['console.log', 'console.debug', 'console.info'],
      sourcemap: true,
      sourcesContent: false,
      format: 'esm',
      mainFields: ['browser', 'module', 'main'],
      conditions: ['browser', 'import', 'default'],
      banner: {
        js: '// This bundle is optimized and secured with esbuild'
      }
    }
  },

  server: {
    strictPort: true,
    hmr: {
      protocol: 'wss',
      clientPort: 443
    },
    headers: {
      'Content-Security-Policy': cspHeaders,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    },
    fs: {
      strict: true,
      allow: ['.'],
      deny: ['.env', '.env.*', '*.{pem,crt,key}', 'node_modules/.cache']
    },
    origin: 'http://localhost:5173',
    cors: false,
    proxy: null,
    middlewareMode: false
  },

  preview: {
    port: 5173,
    strictPort: true,
    headers: {
      'Content-Security-Policy': cspHeaders,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization, X-Custom-Header',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    },
  }
});
