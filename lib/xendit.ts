/**
 * Xendit API Client
 * Provides type-safe methods for interacting with Xendit Payment Sessions API
 */

const XENDIT_API_URL = 'https://api.xendit.co'

/**
 * Xendit Payment Session request payload
 */
export interface CreateSessionRequest {
  reference_id: string
  session_type: 'PAY'
  mode: 'PAYMENT_LINK'
  amount: number
  currency: string
  country: string
  success_return_url: string
  cancel_return_url: string
}

/**
 * Xendit Payment Session response
 */
export interface CreateSessionResponse {
  payment_session_id: string // Session ID (e.g., ps-xyz...)
  reference_id: string
  status: string
  payment_link_url: string
  amount: number
  currency: string
  created: string
  updated: string
}

/**
 * Xendit Session Status response
 */
export interface SessionStatusResponse {
  payment_session_id: string
  reference_id: string
  status: 'PENDING' | 'PAID' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  amount: number
  currency: string
  created: string
  updated: string
}

/**
 * Creates a new Xendit payment session
 * @param request - Payment session configuration
 * @returns Payment session details including payment link URL
 * @throws Error if Xendit API call fails
 */
export async function createPaymentSession(
  request: CreateSessionRequest,
): Promise<CreateSessionResponse> {
  const secretKey = process.env.XENDIT_SECRET_KEY

  if (!secretKey) {
    throw new Error('XENDIT_SECRET_KEY environment variable is not set')
  }

  // Create Basic Auth header
  const authHeader = `Basic ${Buffer.from(secretKey + ':').toString('base64')}`

  const response = await fetch(`${XENDIT_API_URL}/sessions`, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      `Xendit API error: ${response.status} - ${JSON.stringify(errorData)}`,
    )
  }

  return response.json()
}

/**
 * Retrieves the current status of a payment session
 * @param sessionId - The Xendit session ID (e.g., ps-xyz...)
 * @returns Current session status and details
 * @throws Error if Xendit API call fails
 */
export async function getSessionStatus(
  sessionId: string,
): Promise<SessionStatusResponse> {
  const secretKey = process.env.XENDIT_SECRET_KEY

  if (!secretKey) {
    throw new Error('XENDIT_SECRET_KEY environment variable is not set')
  }

  // Create Basic Auth header
  const authHeader = `Basic ${Buffer.from(secretKey + ':').toString('base64')}`

  const response = await fetch(`${XENDIT_API_URL}/sessions/${sessionId}`, {
    method: 'GET',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      `Xendit API error: ${response.status} - ${JSON.stringify(errorData)}`,
    )
  }

  return response.json()
}
