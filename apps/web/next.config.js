import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['http://localhost:3000'],
  // Enable standalone output for Docker (only for production builds)
  output: 'standalone',
  transpilePackages: ['@repo/types'],
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

export default nextConfig;
