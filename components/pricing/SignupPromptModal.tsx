"use client"

import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SignupPromptModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SignupPromptModal({ isOpen, onClose }: SignupPromptModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleSignup = () => {
    router.push('/signup')
    onClose()
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-neutral-900">
              Join GALING PUP — free for students
            </h2>
            <p className="text-neutral-600">
              Unlock unlimited access to research papers, AI-generated summaries, and a personal library tailored to your studies. Sign up as a student to get started.
            </p>

            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-3 w-3 rounded-full bg-pup-maroon" />
                <span className="text-neutral-700">Save papers to your personal library</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-3 w-3 rounded-full bg-pup-maroon" />
                <span className="text-neutral-700">Generate citations and AI summaries</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-3 w-3 rounded-full bg-pup-maroon" />
                <span className="text-neutral-700">Download and bookmark research</span>
              </li>
            </ul>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={onClose}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700 transition hover:bg-neutral-50 sm:w-auto"
              >
                Maybe later
              </button>
              <button
                onClick={handleSignup}
                className="w-full rounded-xl bg-pup-maroon px-4 py-2 text-sm font-semibold text-white transition hover:bg-pup-maroon/90 sm:w-auto"
              >
                Sign up as Student
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
