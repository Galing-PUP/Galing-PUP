'use client'

import { Suspense } from 'react'
import { Button } from '@/components/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { verifyUserInDb } from '@/lib/actions'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import sideIllustration from '@/assets/Graphics/side-img-user-signin.png'
import starLogo from '@/assets/Logo/star-logo-yellow.png'

function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(0)

  useEffect(() => {
    if (!email) {
      toast.error('Email is missing')
      router.push('/signin')
    }
  }, [email, router])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timer])

  const handleVerify = async () => {
    if (!email || otp.length !== 8) return
    setLoading(true)

    try {
      // Step 1: Verify the OTP with Supabase
      const supabase = createClient()
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup',
      })

      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }

      // Step 2: Update the user's status in our database
      // This sets isVerified to true and updates the role
      if (data.user) {
        await verifyUserInDb(email, data.user.id)
      } else {
        await verifyUserInDb(email)
      }

      // Step 3: Redirect to home page on success
      toast.success('Account verified successfully!')
      router.push('/')
    } catch (error) {
      toast.error('Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) return
    setLoading(true)
    try {
      // Request a new OTP code from Supabase
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Verification code sent!')
        // Reset timer to 120 seconds
        setTimer(120)
      }
    } catch (error) {
      toast.error('Failed to resend code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white lg:flex-row">
      <div className="flex w-full flex-col px-6 py-6 lg:w-1/2 lg:px-16 lg:py-8">
        <Link
          href="/signin"
          className="flex w-fit items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6">
          <Image
            src={starLogo}
            alt="Galing PUP star logo"
            width={56}
            height={56}
            priority
            className="h-12 w-12"
          />

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-neutral-900">
              Verify your account
            </h1>
            <p className="text-sm text-neutral-500">
              Enter the 8-digit code sent to <strong>{email}</strong>
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={8}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot
                    index={0}
                    className="border-neutral-300 focus:border-pup-maroon focus:ring-pup-maroon/20"
                  />
                  <InputOTPSlot
                    index={1}
                    className="border-neutral-300 focus:border-pup-maroon focus:ring-pup-maroon/20"
                  />
                  <InputOTPSlot
                    index={2}
                    className="border-neutral-300 focus:border-pup-maroon focus:ring-pup-maroon/20"
                  />
                  <InputOTPSlot
                    index={3}
                    className="border-neutral-300 focus:border-pup-maroon focus:ring-pup-maroon/20"
                  />
                  <InputOTPSlot
                    index={4}
                    className="border-neutral-300 focus:border-pup-maroon focus:ring-pup-maroon/20"
                  />
                  <InputOTPSlot
                    index={5}
                    className="border-neutral-300 focus:border-pup-maroon focus:ring-pup-maroon/20"
                  />
                  <InputOTPSlot
                    index={6}
                    className="border-neutral-300 focus:border-pup-maroon focus:ring-pup-maroon/20"
                  />
                  <InputOTPSlot
                    index={7}
                    className="border-neutral-300 focus:border-pup-maroon focus:ring-pup-maroon/20"
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              shape="rounded"
              disabled={otp.length !== 8 || loading}
              onClick={handleVerify}
            >
              {loading ? 'Verifying...' : 'Verify Account'}
            </Button>

            <div className="flex justify-center">
              {timer > 0 ? (
                <p className="text-sm text-neutral-500">
                  Resend code in {timer}s
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="text-sm font-medium text-pup-maroon hover:underline disabled:opacity-50"
                >
                  Resend the code
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative hidden flex-1 items-center justify-end pt-2 lg:flex">
        <Image
          src={sideIllustration}
          alt="Student illustration"
          width={680}
          height={1024}
          priority
          className="-mr-8 h-full w-full object-contain"
        />
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <p className="text-neutral-500">Loading...</p>
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  )
}
