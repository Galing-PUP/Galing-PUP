'use client'

import Svg410 from '@/assets/Graphics/410.svg'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

/**
 * 410 Gone Error Page
 * Displayed when a document has been deleted or is no longer available.
 */
export default function GonePage() {
  return (
    <Suspense>
      <GoneContent />
    </Suspense>
  )
}

function GoneContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paperId = searchParams.get('paper')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="flex w-full max-w-md flex-col items-center space-y-8 text-center">
        {/* Responsive centered SVG */}
        <div className="relative h-64 w-full sm:h-80">
          <Image
            src={Svg410}
            alt="410 Gone"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Message */}
        <p className="text-lg font-medium text-pup-maroon sm:text-xl">
          The page you are finding maybe deleted / moved somewhere else who
          knows? just like schrodinger cat
        </p>

        {paperId && (
          <p className="text-sm text-gray-500 font-mono">
            Reference ID: {paperId}
          </p>
        )}

        {/* Action Button */}
        <Button
          onClick={() => router.back()}
          className="bg-pup-maroon hover:bg-pup-maroon/90 text-white font-semibold px-8"
        >
          Return to previous page
        </Button>
      </div>
    </div>
  )
}
