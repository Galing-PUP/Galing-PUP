import type { NextConfig } from 'next'
 
const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // This block is for Turbopack (next dev)
  // It's a top-level property, not inside 'experimental'
  turbopack: {
    rules: {
      // Add this rule for SVGs
      '*.svg': {
        as: '*.js', // Treat SVG imports as JavaScript modules
        loaders: ['@svgr/webpack'],
      },
    },
  },

  // This block is for Webpack (next build)
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })
 
    return config
  },
}
 
export default nextConfig