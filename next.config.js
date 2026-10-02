/** @type {import('next').NextConfig} */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const site = new URL(siteUrl);
const protocol = site.protocol.replace(':', '');

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      {
        protocol,
        hostname: site.hostname,
        port: site.port || undefined,
        pathname: '/api/media/**',
      },
      { protocol: 'http', hostname: 'localhost', pathname: '/api/media/**' },
      { protocol: 'http', hostname: '127.0.0.1', pathname: '/api/media/**' },
    ],
  },
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react'],
  },
};

export default nextConfig;