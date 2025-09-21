/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Force static export - no SSR
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true
  },
}

module.exports = nextConfig