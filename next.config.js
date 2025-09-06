/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // <-- evita "ESLint must be installed..."
  },
  typescript: {
    ignoreBuildErrors: true,  // opcional, por si hay TS pendiente
  },
};

module.exports = nextConfig;
