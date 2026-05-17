import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  cacheComponents: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', '@dr/ui'],
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  transpilePackages: ['@dr/ui', '@dr/db', '@dr/charts'],
  output: 'standalone',
};

export default nextConfig;
