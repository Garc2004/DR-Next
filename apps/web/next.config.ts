import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  cacheComponents: true,
  experimental: {
    optimizePackageImports: ['lucide-react', '@dr/ui'],
  },
  compiler: {
    // SWC compiler (default since Next 12; declared explicitly)
    removeConsole:
      process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  transpilePackages: ['@dr/ui', '@dr/db', '@dr/charts', 'recharts'],
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
