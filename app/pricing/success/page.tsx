'use client'

import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type VerificationState = 'loading' | 'success' | 'error'

/**
 * Payment Success Page
 * Verifies payment status after user returns from Xendit payment page
 */
export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const referenceId = searchParams.get('ref')

  const [state, setState] = useState<VerificationState>('loading')
  const [message, setMessage] = useState('Verifying your payment...')

  useEffect(() => {
    /**
     * Verifies the payment with the backend
     */
    async function verifyPayment() {
      if (!referenceId) {
        setState('error')
        setMessage('Invalid payment reference. Please contact support.')
        return
      }

      try {
        const response = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ referenceId }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setState('success')
          setMessage(
            data.alreadyUpgraded
              ? 'You are already a premium member!'
              : 'Upgrade successful! Welcome to Premium!',
          )

          // Redirect to browse page after 3 seconds
          setTimeout(() => {
            window.location.href = '/browse'
          }, 3000)
        } else {
          setState('error')
          setMessage(
            data.error || 'Payment verification failed. Please try again.',
          )
        }
      } catch (error) {
        console.error('Verification error:', error)
        setState('error')
        setMessage(
          'An error occurred while verifying your payment. Please contact support.',
        )
      }
    }

    verifyPayment()
  }, [referenceId, router])

  /**
   * Retry verification
   */
  const handleRetry = () => {
    setState('loading')
    setMessage('Verifying your payment...')
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {/* Loading State */}
        {state === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-pup-maroon mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Processing Payment
            </h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {/* Success State */}
        {state === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">
              Redirecting to browse page in 3 seconds...
            </p>
          </>
        )}

        {/* Error State */}
        {state === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verification Failed
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleRetry}
                className="bg-pup-maroon text-white px-6 py-2 rounded-lg hover:bg-pup-maroon/80 transition-colors"
              >
                Try Again
              </button>
              <a
                href="/pricing"
                className="text-pup-maroon hover:underline text-sm"
              >
                Return to Pricing
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
