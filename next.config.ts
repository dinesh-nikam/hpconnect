/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['emailtemplate23.netlify.app'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'emailtemplate23.netlify.app',
        pathname: '/**',
      }
    ]
  },
  typescript: {
    // During development you can disable this
    ignoreBuildErrors: true
  },
  eslint: {
    // During development you can disable this
    ignoreDuringBuilds: true
  },
  experimental: {
    serverActions: true,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB: process.env.MONGODB_DB,
  },
  // Optimize for Vercel deployment
  optimizeFonts: true,
  compress: true,
  productionBrowserSourceMaps: false,
  // Configure redirects
  async redirects() {
    return [
      {
        source: '/admin',
        has: [
          {
            type: 'header',
            key: 'authorization',
          },
        ],
        destination: '/admin/dashboard/DC',
        permanent: false,
      },
    ]
  }
}

module.exports = nextConfig