import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['sequelize', 'pg', 'pg-hstore', 'bcryptjs'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.cdn.printful.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
