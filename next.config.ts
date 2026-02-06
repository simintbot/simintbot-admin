import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    // Fallback intelligent si API_URL n'est pas définie
    const isProd = process.env.NODE_ENV === 'production';
    const defaultUrl = isProd 
      ? 'https://api.simint-bot.com/api/v1' 
      : 'https://devapi.simint-bot.com/api/v1';
      
    const apiUrl = process.env.API_URL || defaultUrl;
    
    console.log(`[NextConfig] Proxy configuring to: ${apiUrl} (Env: ${process.env.NODE_ENV})`);
    
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
