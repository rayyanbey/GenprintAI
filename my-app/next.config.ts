import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['sequelize', 'pg', 'pg-hstore', 'bcryptjs'],
  /* config options here */
};

export default nextConfig;
