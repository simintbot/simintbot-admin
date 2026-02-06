import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    // API_URL doit être définie au niveau du serveur (ex: docker-compose)
    // Elle ne doit PAS être /api/proxy (qui est l'URL publique)
    const apiUrl = process.env.API_URL || 'http://localhost:8000/api/v1';
    console.log('Proxy configuring to:', apiUrl);
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
