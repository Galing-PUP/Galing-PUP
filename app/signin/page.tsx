'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import sideIllustration from '@/assets/Graphics/side-img-user-signin.png'
import starLogo from '@/assets/Logo/star-logo-yellow.png'
import { GoogleIcon } from '@/components/button' // Keep custom icon if specific
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  checkUserStatus,
  getCurrentUser,
  verifyCredentials,
} from '@/lib/actions'
import { signInWithGooglePopup } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import {
  signInSchema,
  type SignInFormValues,
} from '@/lib/validations/auth-schema'
import { useEffect } from 'react'

export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        const user = await getCurrentUser()
        if (user) {
          const isAdmin = user.role === 'ADMIN' || user.role === 'SUPERADMIN'
          router.replace(isAdmin ? '/admin/publication' : '/')
        }
      }
    }
    checkSession()
  }, [router])

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  const handleGoogleSignIn = async () => {
    try {
      const { user, error } = await signInWithGooglePopup('signin')
      if (error) {
        toast.error(error.message)
        return
      }
      if (user) {
        const supabase = createClient()
        await supabase.auth.setSession({
          access_token: user.session?.access_token || '',
          refresh_token: user.session?.refresh_token || '',
        })
        toast.success('Successfully signed in with Google!')
        router.push('/')
        router.refresh()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google')
    }
  }

  const onSubmit = async (data: SignInFormValues) => {
    setIsLoading(true)
    const { email: emailOrUsername, password } = data

    try {
      // 1. Check if user exists and get their status
      const status = await checkUserStatus(emailOrUsername)

      if (!status.exists) {
        toast.error('User does not exist, please sign up')
        setIsLoading(false)
        return
      }

      // Check if user is verified
      if (!status.isVerified) {
        toast.error(
          'User is not verified, please check your email for the code',
        )
        router.push(
          `/verify-otp?email=${encodeURIComponent(
            status.email || emailOrUsername,
          )}`,
        )
        setIsLoading(false)
        return
      }

      // 2. Verify password with the resolved email from status (to handle username login)
      const validCredentials = await verifyCredentials(
        status.email || emailOrUsername,
        password,
      )

      if (!validCredentials) {
        toast.error('Invalid credentials')
        setIsLoading(false)
        return
      }

      // 3. Sign in with Supabase
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: status.email || emailOrUsername,
        password,
      })

      if (error) {
        toast.error(error.message)
        setIsLoading(false)
        return
      }

      toast.success('Signed in successfully')
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white lg:flex-row">
      <div className="flex w-full flex-col overflow-y-auto px-6 py-8 lg:w-1/2 lg:px-16 lg:py-12">
        <Link
          href="/"
          className="flex w-fit items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-10">
          <Image
            src={starLogo}
            alt="Galing PUP star logo"
            width={64}
            height={64}
            priority
            className="h-14 w-14"
          />

          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold text-neutral-900">
              Sign in to your account
            </h1>
            <p className="text-base text-neutral-500">
              Let&apos;s get you back to learning and discovery.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-neutral-700"
              >
                Email or Username
              </Label>
              <Input
                id="email"
                placeholder="Enter your email or username"
                className="rounded-lg border-neutral-300 px-4 py-6 text-base"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-neutral-700"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="rounded-lg border-neutral-300 px-4 py-6 pr-12 text-base"
                  {...register('password')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-neutral-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-neutral-400" />
                  )}
                  <span className="sr-only">
                    {showPassword ? 'Hide password' : 'Show password'}
                  </span>
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                variant="link"
                type="button"
                className="h-auto p-0 text-sm font-medium text-[#7C1D1D] hover:underline"
                asChild
              >
                <Link href="/forgot-password">Forgot Password?</Link>
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full rounded-lg bg-[#7C1D1D] py-6 text-base hover:bg-[#5a1515]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="flex items-center gap-4 text-sm font-medium text-neutral-400">
              <span className="h-px flex-1 bg-neutral-200" />
              Or continue with
              <span className="h-px flex-1 bg-neutral-200" />
            </div>

            <button
              type="button"
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 transition hover:bg-neutral-50"
              onClick={handleGoogleSignIn}
            >
              <GoogleIcon className="h-5 w-5" />
            </button>
          </form>
        </div>

        <div className="mt-auto flex justify-center pt-8">
          <p className="text-sm text-neutral-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-semibold text-pup-maroon transition hover:underline"
            >
              Create One
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden flex-1 items-center justify-end pt-2 lg:flex">
        <Image
          src={sideIllustration}
          alt="Student illustration for sign in"
          width={680}
          height={1024}
          priority
          className="-mr-8 h-full w-full object-contain"
        />
      </div>
    </div>
  )
}
