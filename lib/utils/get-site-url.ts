/**
 * Get the site URL for the current environment
 * Priority order:
 * 1. NEXT_PUBLIC_SITE_URL (custom domain for production: galing-pup.meinard.dev)
 * 2. NEXT_PUBLIC_VERCEL_URL (Vercel's auto-generated URL for preview deployments)
 * 3. window.location.origin (fallback for local development)
 *
 * @returns The site URL with protocol (e.g., https://galing-pup.meinard.dev)
 */
export function getSiteUrl(): string {
  // For client-side code
  if (typeof window !== 'undefined') {
    return (
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : 'http://localhost:3000')
    )
  }

  // For server-side code
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
  )
}
