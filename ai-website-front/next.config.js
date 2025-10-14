module.exports = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dqevdpzo1zu4d.cloudfront.net',
        port: '',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    loader: 'default',
    loaderFile: '',
    disableStaticImages: false,
    unoptimized: false,
  },
  serverRuntimeConfig: {
    internalApiToken: process.env.INTERNAL_API_TOKEN,
  },
};