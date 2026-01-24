import { EMAIL_FROM, resend } from './resend'
import { getApprovedEmailTemplate, getRejectedEmailTemplate } from './templates'

/**
 * Sends an approval email to the user
 * @param recipientEmail - The email address of the recipient
 * @returns Promise that resolves when email is sent
 */
export async function sendApprovalEmail(recipientEmail: string): Promise<void> {
  try {
    const htmlContent = getApprovedEmailTemplate(recipientEmail)

    await resend.emails.send({
      from: EMAIL_FROM,
      to: recipientEmail,
      subject: 'PUP Galing Admin Account Approved',
      html: htmlContent,
    })

    console.log(`Approval email sent to: ${recipientEmail}`)
  } catch (error) {
    console.error('Error sending approval email:', error)
    throw error
  }
}

/**
 * Sends a rejection email to the user
 * @param recipientEmail - The email address of the recipient
 * @returns Promise that resolves when email is sent
 */
export async function sendRejectionEmail(
  recipientEmail: string,
): Promise<void> {
  try {
    const htmlContent = getRejectedEmailTemplate(recipientEmail)

    await resend.emails.send({
      from: EMAIL_FROM,
      to: recipientEmail,
      subject: 'PUP Galing Admin Account Status',
      html: htmlContent,
    })

    console.log(`Rejection email sent to: ${recipientEmail}`)
  } catch (error) {
    console.error('Error sending rejection email:', error)
    throw error
  }
}
