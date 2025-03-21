/**
 * Next.js configuration
 * Using module.exports pattern for maximum compatibility
 */

// Define the configuration with proper TypeScript types
const nextConfig = {
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
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
  }
};

export default nextConfig;
