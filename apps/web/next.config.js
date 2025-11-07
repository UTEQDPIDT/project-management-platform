/** @type {import('next').NextConfig} */
const nextConfig = {
    allowedDevOrigins: ['http://localhost:3000'],
    // Enable standalone output for Docker
    output: 'standalone',
};

export default nextConfig;
