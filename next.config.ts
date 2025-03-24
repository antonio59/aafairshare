/**
 * Next.js configuration
 * Using module.exports pattern for maximum compatibility
 */

import type { Configuration as WebpackConfig } from 'webpack';

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // Skip static rendering of these routes in production
  // to avoid the SSR errors with Supabase and document access
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  webpack: (config: WebpackConfig, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          fs: false,
          path: false,
          os: false,
          crypto: false,
          stream: false,
          http: false,
          https: false,
          zlib: false,
        },
      };
    }
    return config;
  },
  experimental: {
    typedRoutes: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    // We'll run ESLint separately with our new config
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;