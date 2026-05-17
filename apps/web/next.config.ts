import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    ppr: 'incremental',
    dynamicIO: true,
    reactCompiler: false,
    optimizePackageImports: ['lucide-react', 'recharts', '@dr/ui'],
  },
  compiler: {
    // SWC compiler (default since Next 12; declared explicitly)
    removeConsole:
      process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
    emotion: false,
  },
  transpilePackages: ['@dr/ui', '@dr/db', '@dr/charts'],
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
