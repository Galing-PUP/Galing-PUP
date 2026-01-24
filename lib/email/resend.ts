import { Resend } from 'resend'

/**
 * Validates that the Resend API key is configured
 */
if (!process.env.RESEND_API_KEY) {
  console.warn(
    'RESEND_API_KEY is not configured. Email sending will not work.',
  )
}

/**
 * Initializes and exports the Resend client using the API key from environment variables
 */
export const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * The email address to use as the sender for all emails
 */
export const EMAIL_FROM =
  process.env.EMAIL_FROM || 'noreply@galing-pup.meinard.dev'
