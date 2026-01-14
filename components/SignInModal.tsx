'use client'

import { User, Users, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleUserSignIn = () => {
    router.push('/signin')
    onClose()
  }

  const handleAdminSignIn = () => {
    router.push('/admin/signin')
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-neutral-900">
                Choose Sign In Type
              </h2>
              <p className="text-sm text-neutral-500">
                Select how you would like to sign in to continue.
              </p>
            </div>

            <div className="space-y-3">
              {/* User Sign In Button */}
              <button
                onClick={handleUserSignIn}
                className="w-full rounded-xl border-2 border-neutral-200 bg-white p-6 text-left transition hover:border-pup-maroon hover:bg-neutral-50"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pup-maroon text-white">
                    <User />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900">
                      Sign in as User
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      Access your personal account and library
                    </p>
                  </div>
                </div>
              </button>

              {/* Admin Sign In Button */}
              <button
                onClick={handleAdminSignIn}
                className="w-full rounded-xl border-2 border-neutral-200 bg-white p-6 text-left transition hover:border-pup-maroon hover:bg-neutral-50"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pup-maroon text-white">
                    <Users />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900">
                      Sign in as Admin
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      Access the administrative dashboard
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
