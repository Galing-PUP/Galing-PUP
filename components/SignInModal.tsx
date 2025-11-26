"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleUserSignIn = () => {
    router.push("/signin");
    onClose();
  };

  const handleAdminSignIn = () => {
    router.push("/admin/signin");
    onClose();
  };

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
                className="w-full rounded-xl border-2 border-neutral-200 bg-white p-6 text-left transition hover:border-[#7C1D1D] hover:bg-neutral-50"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7C1D1D]/10">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#7C1D1D"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z" />
                      <path d="M20.59 21a8 8 0 0 0-17.18 0" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900">
                      Sign in as User
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      Access your personal account and library
                    </p>
                  </div>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-1 text-neutral-400"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </button>

              {/* Admin Sign In Button */}
              <button
                onClick={handleAdminSignIn}
                className="w-full rounded-xl border-2 border-neutral-200 bg-white p-6 text-left transition hover:border-[#7C1D1D] hover:bg-neutral-50"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7C1D1D]/10">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#7C1D1D"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900">
                      Sign in as Admin
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      Access the administrative dashboard
                    </p>
                  </div>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-1 text-neutral-400"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
