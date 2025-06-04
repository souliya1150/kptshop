/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['res.cloudinary.com'],
    unoptimized: true,
  },
  experimental: {
    serverActions: true,
  },
  // Add assetPrefix for Netlify
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://kptshop.netlify.app' : undefined,
}

module.exports = nextConfig 