import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
  },
  serverRuntimeConfig: {
    internalApiToken: process.env.INTERNAL_API_TOKEN,
  },
  // 포트를 3000으로 고정
  env: {
    PORT: '3000',
  },
};

export default nextConfig;