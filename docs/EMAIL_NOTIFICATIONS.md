# Email Notification System

This document describes the email notification system implemented using Resend.

## Overview

The system sends automated email notifications when a superadmin approves or rejects a user's admin access request.

## Architecture

### Files Structure
```
lib/email/
├── resend.ts       # Resend client configuration
├── templates.ts    # HTML email templates
└── service.ts      # Email sending functions
```

### Integration Point

Email sending is integrated into the user management API route:
- **Route**: `/api/admin/users/[id]/route.ts`
- **Method**: `PATCH`
- **Trigger**: When user status changes from `PENDING` to `APPROVED` or `DELETED`

## Email Templates

### Approved Email
- **Subject**: "PUP Galing Admin Account Approved"
- **Content**: Congratulatory message with link to admin panel
- **Color Scheme**: Official PUP colors (Maroon #7a1f1f, Gold #f5c76b)

### Rejected Email
- **Subject**: "PUP Galing Admin Account Status"
- **Content**: Polite rejection message with contact information
- **Color Scheme**: Same as approved email for consistency

## Environment Variables

Required environment variables in `.env`:

```bash
# Resend API key (get from https://resend.com)
RESEND_API_KEY=re_xxx

# Email sender address (must be verified in Resend)
EMAIL_FROM=noreply@galing-pup.meinard.dev
```

## Usage

The email system is automatically triggered when:
1. A superadmin updates a user's status in the admin panel
2. The status changes from `PENDING` to:
   - `APPROVED` → Sends approval email
   - `DELETED` → Sends rejection email

No manual intervention is required.

## Error Handling

- Email sending failures are logged but do not prevent the status update
- The system continues to operate normally even if email delivery fails
- Failed email attempts are logged to the console for debugging

## Testing

To test the email system:

1. Set up Resend account and get API key
2. Add environment variables to `.env`
3. Create a test user with status `PENDING`
4. Use the admin panel to approve or reject the user
5. Check the recipient's email inbox

## Technical Details

- **SDK**: Resend Node.js SDK
- **Template Format**: Raw HTML (no React components)
- **Delivery**: Server-side only (Next.js API route)
- **Async**: Email sending is awaited but errors don't block the response

## Security Considerations

- API key is stored in environment variables (never committed)
- Email addresses are validated by Prisma schema
- Only authorized admins can trigger email sending via the API
