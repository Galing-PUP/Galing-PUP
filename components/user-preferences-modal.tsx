'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { deleteUserAccount } from '@/lib/actions'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RoleName } from '@/lib/generated/prisma/enums'
import { createClient } from '@/lib/supabase/client'
import {
  userPreferencesSchema,
  type UserPreferencesFormValues,
} from '@/lib/validations/user-preferences-schema'

type UserPreferencesModalProps = {
  isOpen: boolean
  onClose: () => void
  initialUsername: string
  userRole?: RoleName
  onUsernameUpdated?: (nextUsername: string) => void
}

/**
 * Modal for updating the authenticated user's own preferences.
 *
 * Allows changing the display username and optionally setting a new password.
 * Submits changes to `/api/user/preferences` and notifies the parent when
 * the username has been updated so the UI header can reflect the change.
 */
export function UserPreferencesModal({
  isOpen,
  onClose,
  initialUsername,
  userRole,
  onUsernameUpdated,
}: UserPreferencesModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Delete account state
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [showDeletePassword, setShowDeletePassword] = useState(false)

  const form = useForm<UserPreferencesFormValues>({
    resolver: zodResolver(userPreferencesSchema),
    defaultValues: {
      username: initialUsername,
      newPassword: '',
      confirmPassword: '',
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    watch,
  } = form

  // Watch form values to detect changes
  const watchedValues = watch()

  // Check if there are actual changes
  const hasChanges = useMemo(() => {
    const usernameChanged = watchedValues.username?.trim() !== initialUsername
    const passwordChanged =
      watchedValues.newPassword && watchedValues.newPassword.length > 0
    return usernameChanged || passwordChanged
  }, [watchedValues.username, watchedValues.newPassword, initialUsername])

  // Reset form when modal opens or initialUsername changes
  useEffect(() => {
    if (isOpen) {
      reset({
        username: initialUsername,
        newPassword: '',
        confirmPassword: '',
      })
      setShowNewPassword(false)
      setShowConfirmPassword(false)
      setIsDeleting(false)
      setDeletePassword('')
      setShowDeletePassword(false)
    }
  }, [isOpen, initialUsername, reset])

  /**
   * Handles closing the modal and resetting state
   */
  const handleClose = () => {
    if (isSubmitting || isDeletingAccount) return
    onClose()
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setIsDeleting(false)
    setDeletePassword('')
  }

  /**
   * Handles account deletion with password verification
   */
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password')
      return
    }

    setIsDeletingAccount(true)
    toast.loading('Deleting account...', { id: 'delete-account' })

    try {
      const result = await deleteUserAccount(deletePassword)

      if (!result.success) {
        toast.error(result.error || 'Failed to delete account', {
          id: 'delete-account',
        })
        return
      }

      toast.success('Account deleted successfully', { id: 'delete-account' })

      // Close modal and redirect to home
      onClose()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Failed to delete account. Please try again.', {
        id: 'delete-account',
      })
    } finally {
      setIsDeletingAccount(false)
    }
  }

  /**
   * Handles form submission with username availability check
   */
  const onSubmit = async (data: UserPreferencesFormValues) => {
    const trimmedUsername = data.username.trim()
    const isPasswordChanged = data.newPassword && data.newPassword.length > 0

    // Check username availability if it changed
    if (trimmedUsername !== initialUsername) {
      try {
        const checkResponse = await fetch(
          `/api/user/preferences?username=${encodeURIComponent(
            trimmedUsername,
          )}`,
        )

        if (!checkResponse.ok) {
          throw new Error('Failed to check username')
        }

        const checkData: { available: boolean; username: string } =
          await checkResponse.json()

        if (!checkData.available) {
          setError('username', {
            type: 'manual',
            message: 'This username is already taken',
          })
          return
        }
      } catch (error) {
        console.error('Error checking username availability:', error)
        toast.error('Failed to check username availability')
        return
      }
    }

    // Submit the form
    try {
      setIsSubmitting(true)
      toast.loading('Saving preferences...', { id: 'preferences' })

      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: trimmedUsername,
          newPassword: data.newPassword || undefined,
        }),
      })

      if (!response.ok) {
        const responseData = await response.json().catch(() => ({}))
        const message = responseData.error || 'Failed to update preferences.'
        throw new Error(message)
      }

      const result: { username: string | null } = await response.json()

      if (result.username) {
        onUsernameUpdated?.(result.username)
      }

      toast.success('Preferences updated successfully.', {
        id: 'preferences',
      })

      handleClose()

      // If password was changed, sign out and redirect to home
      if (isPasswordChanged) {
        const supabase = createClient()
        await supabase.auth.signOut()

        toast.success(
          'Password changed. Please sign in with your new password.',
        )
        router.push('/')
        router.refresh()
      }
    } catch (error: unknown) {
      console.error('Failed to update preferences:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update preferences. Please try again.',
        { id: 'preferences' },
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        {!isDeleting ? (
          // Main Preferences View
          <>
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl font-semibold text-neutral-900">
                User Preferences
              </DialogTitle>
              <DialogDescription className="text-sm text-neutral-500">
                Update your display name or set a new password for your account.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
              {/* Username Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="preferences-username"
                  className="text-xs font-semibold uppercase tracking-wide text-neutral-600"
                >
                  Username
                </Label>
                <Input
                  id="preferences-username"
                  type="text"
                  placeholder="Enter your username"
                  {...register('username')}
                  className="rounded-lg border-neutral-300 focus:border-pup-maroon focus:ring-pup-maroon"
                />
                {errors.username && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* New Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="preferences-new-password"
                  className="text-xs font-semibold uppercase tracking-wide text-neutral-600"
                >
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="preferences-new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter new password (optional)"
                    {...register('newPassword')}
                    className="rounded-lg border-neutral-300 pr-9 focus:border-pup-maroon focus:ring-pup-maroon"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 rounded-l-none text-neutral-400 hover:bg-transparent focus-visible:ring-ring/50"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                    <span className="sr-only">
                      {showNewPassword ? 'Hide password' : 'Show password'}
                    </span>
                  </Button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="preferences-confirm-password"
                  className="text-xs font-semibold uppercase tracking-wide text-neutral-600"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="preferences-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    {...register('confirmPassword')}
                    className="rounded-lg border-neutral-300 pr-9 focus:border-pup-maroon focus:ring-pup-maroon"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 rounded-l-none text-neutral-400 hover:bg-transparent focus-visible:ring-ring/50"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword ? 'Hide password' : 'Show password'}
                    </span>
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <p className="text-[11px] text-neutral-500">
                Password updates are optional. If you only change your username,
                your password will stay the same.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDeleting(true)}
                  className="text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Delete Account
                </Button>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="text-sm font-medium text-neutral-600 hover:bg-transparent hover:underline"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !hasChanges}
                    className="inline-flex items-center rounded-full bg-pup-maroon px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-pup-maroon/90 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save changes'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </>
        ) : (
          // Delete Account Confirmation View
          <>
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Delete Account
              </DialogTitle>
              <DialogDescription className="text-sm text-neutral-500">
                This action is permanent and cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Warning Message */}
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> Deleting your account will:
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-700">
                  <li>Permanently delete your profile</li>
                  <li>Remove all your bookmarks</li>
                  <li>Delete your activity history</li>
                  <li>Reset you back to free tier if you register again</li>
                  {userRole !== RoleName.REGISTERED && (
                    <li>Reassign uploaded documents to the system owner</li>
                  )}
                </ul>
              </div>

              {/* Password Confirmation */}
              <div className="space-y-2">
                <Label
                  htmlFor="delete-password"
                  className="text-xs font-semibold uppercase tracking-wide text-neutral-600"
                >
                  Enter Your Password to Confirm
                </Label>
                <div className="relative">
                  <Input
                    id="delete-password"
                    type={showDeletePassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="rounded-lg border-neutral-300 pr-9 focus:border-red-500 focus:ring-red-500"
                    disabled={isDeletingAccount}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    disabled={isDeletingAccount}
                    className="absolute inset-y-0 right-0 rounded-l-none text-neutral-400 hover:bg-transparent focus-visible:ring-ring/50"
                  >
                    {showDeletePassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                    <span className="sr-only">
                      {showDeletePassword ? 'Hide password' : 'Show password'}
                    </span>
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsDeleting(false)
                    setDeletePassword('')
                  }}
                  disabled={isDeletingAccount}
                  className="text-sm font-medium text-neutral-600 hover:bg-transparent hover:underline"
                >
                  Go Back
                </Button>
                <Button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount || !deletePassword}
                  className="inline-flex items-center rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
                >
                  {isDeletingAccount ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Confirm Delete'
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default UserPreferencesModal
