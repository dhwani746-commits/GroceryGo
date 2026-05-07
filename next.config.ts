import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.0.205', 'localhost:3000', '192.168.0.205:3000','175.177.1.11','175.177.1.11:3000'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      }
    ]
  },
  async redirects() {
    return [
      {
        source: '/cart',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
