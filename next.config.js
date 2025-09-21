/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Force static export - no SSR
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