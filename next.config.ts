import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  async redirects() {
      return [
          {
              source: '/',
              destination: '/home',
              permanent: true
          }
      ]
  },
  webpack(config){
    config.externals.push('canvas')

    return config
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
