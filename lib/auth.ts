import { getSiteUrl } from '@/lib/utils/get-site-url'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export const signInWithGooglePopup = async (
  intent: 'signin' | 'signup' = 'signin',
) => {
  const siteUrl = getSiteUrl()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback?intent=${intent}&popup=true`,
      skipBrowserRedirect: true,
    },
  })

  if (error) throw error

  if (data.url) {
    const width = 500
    const height = 600
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    window.open(
      data.url,
      'google-login',
      `width=${width},height=${height},left=${left},top=${top}`,
    )

    return new Promise<{ user: any; error: any }>((resolve, reject) => {
      const messageHandler = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return

        if (event.data.type === 'OAUTH_SUCCESS') {
          window.removeEventListener('message', messageHandler)

          // Fetch the session to return it
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession()

          if (session && session.user) {
            // Return user with session attached to match calling code expectation
            resolve({
              user: { ...session.user, session },
              error: null,
            })
          } else {
            resolve({
              user: null,
              error:
                error ||
                new Error('No session retrieved after successful OAuth'),
            })
          }
        } else if (event.data.type === 'OAUTH_ERROR') {
          window.removeEventListener('message', messageHandler)
          resolve({
            user: null,
            error: new Error(event.data.message || 'Authentication failed'),
          })
        }
      }

      window.addEventListener('message', messageHandler)
    })
  }

  return { user: null, error: new Error('Failed to create OAuth URL') }
}
