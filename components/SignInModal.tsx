'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { User, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const router = useRouter()

  const handleUserSignIn = () => {
    router.push('/signin')
    onClose()
  }

  const handleAdminSignIn = () => {
    router.push('/admin/signin')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-semibold text-neutral-900">
            Choose Sign In Type
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-500">
            Select how you would like to sign in to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          {/* User Sign In Button */}
          <Button
            onClick={handleUserSignIn}
            variant="outline"
            className="w-full h-auto rounded-xl border-2 p-6 text-left hover:border-pup-maroon hover:bg-neutral-50"
          >
            <div className="flex items-start gap-4 w-full">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pup-maroon text-white">
                <User className="h-6 w-6" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-neutral-900">
                  Sign in as User
                </h3>
                <p className="mt-1 text-sm text-neutral-500 font-normal">
                  Access your personal account and library
                </p>
              </div>
            </div>
          </Button>

          {/* Admin Sign In Button */}
          <Button
            onClick={handleAdminSignIn}
            variant="outline"
            className="w-full h-auto rounded-xl border-2 p-6 text-left hover:border-pup-maroon hover:bg-neutral-50"
          >
            <div className="flex items-start gap-4 w-full">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pup-maroon text-white">
                <Users className="h-6 w-6" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-neutral-900">
                  Sign in as Admin
                </h3>
                <p className="mt-1 text-sm text-neutral-500 font-normal">
                  Access the administrative dashboard
                </p>
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
