/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use server runtime on Vercel (supports dynamic routes like /trace/[id])
  output: 'standalone',
  images: { unoptimized: true },
  reactStrictMode: true,
  swcMinify: true,
  eslint: { ignoreDuringBuilds: true },
}

module.exports = nextConfig