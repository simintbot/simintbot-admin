import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? 'https://api.simint-bot.com/api/v1/:path*'
          : 'https://devapi.simint-bot.com/api/v1/:path*',
      },
    ];
  },
};

export default withNextIntl(nextConfig);
