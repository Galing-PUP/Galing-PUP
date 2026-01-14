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
import { GoogleIcon } from '@/components/button' // Keep custom icon
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  checkUsernameAvailability,
  checkUserStatus,
  createUserInDb,
  getCurrentUser,
} from '@/lib/actions'
import { signInWithGoogle } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import {
  signUpSchema,
  type SignUpFormValues,
} from '@/lib/validations/auth-schema'
import { useEffect } from 'react'

export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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

    // Handle OAuth errors from redirect
    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')
    if (error === 'UserExists') {
      toast.error('User already exists. Please sign in instead.')
      router.replace('/signup')
    }
  }, [router])

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle('signup')
      // The browser will redirect to Google OAuth, then back to our callback
      // The callback will handle user creation and redirect to home
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up with Google')
    }
  }

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true)
    const { username, email, password } = data

    try {
      // Step 1: Check username availability
      const { exists: usernameExists } =
        await checkUsernameAvailability(username)
      if (usernameExists) {
        toast.error('Username already exists, please login')
        setIsLoading(false)
        return
      }

      // Step 2: Check supabase auth first to see if email is taken there
      const supabase = createClient()
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
          },
        })

      if (signUpError) {
        // Handle specific case where user exists but might be unverified/verified
        if (signUpError.message.includes('already registered')) {
          const status = await checkUserStatus(email)
          if (status.exists && !status.isVerified) {
            toast.error(
              'User already registered but not verified. Redirecting to verification...',
            )
            router.push(`/verify-otp?email=${encodeURIComponent(email)}`)
          } else {
            toast.error('User already registered, please login')
            router.push('/signin')
          }
        } else {
          toast.error(signUpError.message)
        }
        setIsLoading(false)
        return
      }

      // Step 4: Signup successful, create user in DB and redirect
      if (signUpData.user) {
        await createUserInDb(email, username, signUpData.user.id, password)
      }

      toast.success('Account created! Please verify your email.')
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`)
    } catch (error: any) {
      console.error('Signup error:', error)
      toast.error(error.message || 'Something went wrong during signup')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white lg:flex-row">
      <div className="flex w-full flex-col px-6 py-6 lg:w-1/2 lg:px-16 lg:py-8">
        <Link
          href="/"
          className="flex w-fit items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
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
              Create your account
            </h1>
            <p className="text-sm text-neutral-500">
              Join us to start your learning journey.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* Username Field */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-neutral-700"
              >
                Username
              </Label>
              <Input
                id="username"
                placeholder="Enter your username"
                className="rounded-lg border-neutral-300 px-4 py-2.5 text-base"
                {...register('username')}
              />
              {errors.username && (
                <p className="text-sm text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-neutral-700"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="yourname@gmail.com"
                className="rounded-lg border-neutral-300 px-4 py-2.5 text-base"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
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
                  placeholder="Create a password"
                  className="rounded-lg border-neutral-300 px-4 py-2.5 pr-12 text-base"
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

              {/* Password Requirements Checklist */}

              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-neutral-700"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className="rounded-lg border-neutral-300 px-4 py-2.5 pr-12 text-base"
                  {...register('confirmPassword')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-neutral-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-neutral-400" />
                  )}
                  <span className="sr-only">
                    {showConfirmPassword ? 'Hide password' : 'Show password'}
                  </span>
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="mt-4 w-full rounded-lg bg-[#7C1D1D] py-6 text-base hover:bg-[#5a1515]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
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
              onClick={handleGoogleSignUp}
            >
              <GoogleIcon className="h-5 w-5" />
            </button>
          </form>
        </div>

        <div className="mt-auto flex justify-center pt-8">
          <p className="text-sm text-neutral-500">
            Already have an account?{' '}
            <Link
              href="/signin"
              className="font-semibold text-pup-maroon transition hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden flex-1 items-center justify-end pt-2 lg:flex">
        <Image
          src={sideIllustration}
          alt="Student illustration for sign up"
          width={680}
          height={1024}
          priority
          className="-mr-8 h-full w-full object-contain"
        />
      </div>
    </div>
  )
}
