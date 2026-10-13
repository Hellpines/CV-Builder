import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/users',
        permanent: false,
      },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
