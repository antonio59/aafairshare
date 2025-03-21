/** @type {import('next').NextConfig} */
const nextConfig = {
  // Webpack configuration for polyfills and fallbacks
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false
      };
    }
    return config;
  },
  
  // ESLint configuration optimized for React 19
  eslint: {
    // Warning instead of error for production builds
    ignoreDuringBuilds: false,
    // Modern ESLint configuration
    dirs: ['src']
  },
  
  // TypeScript configuration
  typescript: {
    // Ensure type checking during builds
    ignoreBuildErrors: false
  },
  
  // React 19 optimizations
  reactStrictMode: true,
  
  // Performance optimizations
  compiler: {
    // Remove console.* in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Security headers
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
      ],
    },
  ],
};

module.exports = nextConfig;
