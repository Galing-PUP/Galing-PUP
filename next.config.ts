import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['pdfjs-dist'],
  webpack: (config) => {
    config.resolve.alias.canvas = false
    return config
  },
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn'],
    },
  },
}

export default nextConfig
