import { Resend } from 'resend'

/**
 * Initializes and exports the Resend client using the API key from environment variables
 */
export const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * The email address to use as the sender for all emails
 */
export const EMAIL_FROM =
  process.env.EMAIL_FROM || 'noreply@galing-pup.meinard.dev'
