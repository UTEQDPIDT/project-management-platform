/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['http://localhost:3000'],
  // Enable standalone output for Docker (only for production builds)
  output: 'standalone',
  //   transpilePackages: ['@repo/ui'],
};

export default nextConfig;
