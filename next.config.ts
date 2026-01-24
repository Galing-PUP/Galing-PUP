import { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['pdfjs-dist'],
  outputFileTracingIncludes: {
    '/api/admin/ingest': ['./node_modules/pdfjs-dist/build/**/*'],
  },
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn'],
    },
  },
}

export default nextConfig
