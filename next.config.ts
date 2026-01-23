import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn'],
    },
  },
  serverExternalPackages: ['pdfjs-dist', '@napi-rs/canvas'],
}

export default nextConfig
