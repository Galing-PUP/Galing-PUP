const nextConfig: any = {
  /* config options here */
  serverExternalPackages: ['pdfjs-dist'],
  experimental: {
    outputFileTracingIncludes: {
      '/api/admin/ingest': ['./node_modules/pdfjs-dist/build/**/*'],
    },
  },
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn'],
    },
  },
}

export default nextConfig
