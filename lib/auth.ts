import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export const signInWithProviderPopup = async (provider: 'google' | 'strava', intent: 'signin' | 'signup' = 'signin') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
            redirectTo: `${window.location.origin}/auth/callback?intent=${intent}&popup=true`,
            skipBrowserRedirect: true,
            scopes: provider === 'strava' ? 'read,activity:read_all' : undefined,
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
            `${provider}-login`,
            `width=${width},height=${height},left=${left},top=${top}`
        )

        return new Promise<void>((resolve, reject) => {
            const messageHandler = (event: MessageEvent) => {
                if (event.origin !== window.location.origin) return

                if (event.data.type === 'OAUTH_SUCCESS') {
                    window.removeEventListener('message', messageHandler)
                    resolve()
                } else if (event.data.type === 'OAUTH_ERROR') {
                    window.removeEventListener('message', messageHandler)
                    reject(new Error(event.data.message || 'Authentication failed'))
                }
            }

            window.addEventListener('message', messageHandler)
        })
    }
}

// Backward compatibility helper
export const signInWithGooglePopup = (intent: 'signin' | 'signup' = 'signin') =>
    signInWithProviderPopup('google', intent)
