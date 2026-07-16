import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['pdf-parse'],
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
      allowedOrigins: undefined, // rely on Next.js default (same-origin only) — explicit for documentation
    },
  },
};

export default nextConfig;
