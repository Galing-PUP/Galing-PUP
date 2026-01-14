'use client'

import { colleges } from '@/data/collegeCourses'
import { getCurrentUser } from '@/lib/actions'
import { createClient } from '@/lib/supabase/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import sideIllustration from '@/assets/Graphics/side-img-staff-registration.png'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  requestAccessSchema,
  type RequestAccessFormValues,
} from '@/lib/validations/request-access-schema'

export default function RequestAccessPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const id = useId()

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

  const form = useForm<RequestAccessFormValues>({
    resolver: zodResolver(requestAccessSchema),
    defaultValues: {
      username: '',
      college: 0,
      email: '',
      idNumber: '',
      password: '',
      confirmPassword: '',
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = form

  // Manual file handling since RHF doesn't control file inputs well directly
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setValue('idImage', file)
      await trigger('idImage')
    }
  }

  const onSubmit = async (data: RequestAccessFormValues) => {
    setIsSubmitting(true)
    const toastId = toast.loading('Submitting your request...')

    try {
      const submissionData = new FormData()
      submissionData.append('username', data.username)
      submissionData.append('college', data.college.toString())
      submissionData.append('email', data.email)
      submissionData.append('idNumber', data.idNumber)
      submissionData.append('password', data.password)
      submissionData.append('idImage', data.idImage)

      const response = await fetch('/api/admin/request-access', {
        method: 'POST',
        body: submissionData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit request')
      }

      toast.success(
        'Your request is kindly processing, Please wait for the admin approval',
        { id: toastId, duration: 5000 },
      )

      form.reset()

      // Optional: Redirect after a delay
      setTimeout(() => {
        router.push('/admin/signin')
      }, 3000)
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong', { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  const idImageValue = watch('idImage')

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Left Side - Background Illustration */}
      <div className="relative hidden lg:flex lg:w-[45%]">
        <div className="relative h-full w-full overflow-hidden bg-[#3d0a0a]">
          <Image
            src={sideIllustration}
            alt="Staff registration illustration"
            fill
            priority
            className="object-cover object-[0%_center]"
          />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="relative -ml-20 flex flex-1 flex-col overflow-y-auto rounded-l-3xl bg-neutral-50 shadow-[0_0_60px_rgba(0,0,0,0.7)]">
        {/* Back Button */}
        <div className="absolute left-8 top-8 z-10">
          <Link
            href="/admin/signin"
            className="flex w-fit items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        <div className="flex min-h-full items-center justify-center px-25 py-20">
          <div className="w-full max-w-xl">
            {/* Header */}
            <div className="mb-8 space-y-2">
              <h1 className="text-2xl font-semibold text-neutral-900">
                Request your staff account
              </h1>
              <p className="text-sm text-neutral-500">
                Fill out the form to apply for a staff account and begin your
                journey with us.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name Field */}
              <div className="space-y-2">
                <Label htmlFor="username">Full Name</Label>
                <Input
                  id="username"
                  placeholder="Enter your full name"
                  {...register('username')}
                />
                {errors.username && (
                  <p className="text-sm text-red-500">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* College Dropdown */}
              <div className="space-y-2 w-full">
                <Label htmlFor="college">College</Label>
                <Select
                  onValueChange={(value) =>
                    setValue('college', parseInt(value, 10), {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger id="college" className="w-full">
                    <SelectValue placeholder="Select your college or department" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map((college) => (
                      <SelectItem
                        key={college.id}
                        value={college.id.toString()}
                      >
                        {college.collegeName} ({college.collegeAbbr})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.college && (
                  <p className="text-sm text-red-500">
                    {errors.college.message}
                  </p>
                )}
              </div>

              {/* Email Address and ID Number Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your official email address"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID Number</Label>
                  <Input
                    id="idNumber"
                    placeholder="Enter your ID number"
                    {...register('idNumber')}
                  />
                  {errors.idNumber && (
                    <p className="text-sm text-red-500">
                      {errors.idNumber.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Password and Confirm Password Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="pr-9"
                      {...register('password')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
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

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      className="pr-9"
                      {...register('confirmPassword')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">
                        {showConfirmPassword
                          ? 'Hide password'
                          : 'Show password'}
                      </span>
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* ID Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="idImage">ID Image (Max 5MB)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="idImage"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="cursor-pointer"
                    onChange={handleFileChange}
                  />
                </div>
                {errors.idImage && (
                  <p className="text-sm text-red-500">
                    {errors.idImage.message as string}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push('/admin/signin')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#7C1D1D] hover:bg-[#5a1515]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Create Account Request'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
