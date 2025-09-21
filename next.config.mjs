/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['greenstemglobal.com'],
  },
  env: {
    NEXT_PUBLIC_SATELLITE_API_URL: process.env.NEXT_PUBLIC_SATELLITE_API_URL,
    NEXT_PUBLIC_WEATHER_API_URL: process.env.NEXT_PUBLIC_WEATHER_API_URL,
    NEXT_PUBLIC_TRACE_API_URL: process.env.NEXT_PUBLIC_TRACE_API_URL,
  },
}

export default nextConfig
