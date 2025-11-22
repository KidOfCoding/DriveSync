/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: 'dist',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.imagekit.io',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
};

module.exports = nextConfig;
