import { getSiteUrl } from '@/lib/utils/get-site-url'
import { createClient } from '@/lib/supabase/client'

/**
 * Sign in with Google using OAuth
 * Uses default redirect flow for better reliability across environments
 *
 * @param intent - Whether this is a signin or signup flow
 */
export const signInWithGoogle = async (
  intent: 'signin' | 'signup' = 'signin',
) => {
  const supabase = createClient()
  const siteUrl = getSiteUrl()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback?intent=${intent}`,
    },
  })

  if (error) throw error

  // The browser will automatically redirect to Google's OAuth page
  // After authentication, Google will redirect back to our callback URL
}
