/**
 * Generates the HTML email template for an approved admin account
 * @param recipientEmail - The email address of the recipient
 * @returns HTML string for the approval email
 */
export function getApprovedEmailTemplate(recipientEmail: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>PUP Galing Admin Account Approved</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f7f7f7;
      font-family: Arial, Helvetica, sans-serif;
      color: #222;
    "
  >
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 40px 16px">
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
              max-width: 520px;
              background-color: #ffffff;
              border-radius: 6px;
              overflow: hidden;
            "
          >
            <tr>
              <td style="background-color: #7a1f1f; padding: 16px 24px">
                <h1
                  style="
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #f5c76b;
                  "
                >
                  Galing PUP
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px">
                <p style="margin: 0 0 16px 0; font-size: 14px">Good day,</p>
                <p style="margin: 0 0 16px 0; font-size: 14px">
                  We are pleased to inform you that your <strong>PUP Galing Admin account</strong> has been <strong>successfully approved</strong>.
                </p>
                <p style="margin: 0 0 16px 0; font-size: 14px">
                  You may now access the admin panel by signing in through the link below:
                </p>
                <div
                  style="
                    margin: 24px 0;
                    padding: 16px;
                    text-align: center;
                    border: 1px solid #e5e5e5;
                    border-radius: 4px;
                  "
                >
                  <a
                    href="https://galing-pup.meinard.dev/admin/signin"
                    style="
                      font-size: 16px;
                      font-weight: 600;
                      color: #7a1f1f;
                      text-decoration: none;
                      word-break: break-all;
                    "
                  >
                    Go to Admin Panel
                  </a>
                </div>
                <p style="margin: 0 0 16px 0; font-size: 13px; color: #555; line-height: 1.5;">
                  Please log in using your registered credentials. As an admin, you are granted access to administrative features necessary for managing and overseeing the system. We kindly remind you to use these privileges responsibly and in accordance with university policies.
                </p>
                <p style="margin: 0 0 16px 0; font-size: 13px; color: #555;">
                  If you encounter any issues or have questions, please contact the system administrator for assistance.
                </p>
                <p style="margin: 24px 0 0 0; font-size: 14px">
                  Best regards,<br />
                  <strong>PUP Galing Team</strong><br />
                  Polytechnic University of the Philippines
                </p>
              </td>
            </tr>
            <tr>
              <td
                style="
                  padding: 12px 24px;
                  background-color: #fafafa;
                  font-size: 12px;
                  color: #777;
                "
              >
                © Galing PUP. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

/**
 * Generates the HTML email template for a rejected admin account
 * @param recipientEmail - The email address of the recipient
 * @returns HTML string for the rejection email
 */
export function getRejectedEmailTemplate(recipientEmail: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>PUP Galing Admin Account Status</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f7f7f7;
      font-family: Arial, Helvetica, sans-serif;
      color: #222;
    "
  >
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 40px 16px">
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
              max-width: 520px;
              background-color: #ffffff;
              border-radius: 6px;
              overflow: hidden;
            "
          >
            <tr>
              <td style="background-color: #7a1f1f; padding: 16px 24px">
                <h1
                  style="
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #f5c76b;
                  "
                >
                  Galing PUP
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px">
                <p style="margin: 0 0 16px 0; font-size: 14px">Good day,</p>
                <p style="margin: 0 0 16px 0; font-size: 14px">
                  We regret to inform you that your <strong>PUP Galing Admin account</strong> request has been <strong>rejected</strong>.
                </p>
                <p style="margin: 0 0 16px 0; font-size: 13px; color: #555; line-height: 1.5;">
                  After careful review, your application did not meet the requirements for administrative access at this time. This decision may be due to incomplete information, verification issues, or other administrative considerations.
                </p>
                <p style="margin: 0 0 16px 0; font-size: 13px; color: #555;">
                  If you believe this is an error or would like more information about this decision, please contact the system administrator for assistance.
                </p>
                <p style="margin: 24px 0 0 0; font-size: 14px">
                  Best regards,<br />
                  <strong>PUP Galing Team</strong><br />
                  Polytechnic University of the Philippines
                </p>
              </td>
            </tr>
            <tr>
              <td
                style="
                  padding: 12px 24px;
                  background-color: #fafafa;
                  font-size: 12px;
                  color: #777;
                "
              >
                © Galing PUP. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}
