"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PricingCard } from './pricing-card'
import { PricingClientWrapper } from './pricing-client-wrapper'
import SignupPromptModal from './SignupPromptModal'

interface PricingFeature {
  name: string
  included: boolean
}

interface Props {
  isAuthenticated: boolean
  isPremiumUser: boolean
  freeTierFeatures: PricingFeature[]
  premiumTierFeatures: PricingFeature[]
}

export default function PricingCardsClient({
  isAuthenticated,
  isPremiumUser,
  freeTierFeatures,
  premiumTierFeatures,
}: Props) {
  const [showSignIn, setShowSignIn] = useState(false)
  const router = useRouter()

  const openSignIn = () => setShowSignIn(true)
  const closeSignIn = () => setShowSignIn(false)

  const handleFreeCTA = () => {
    if (isAuthenticated) {
      router.push('/library')
      return
    }
    openSignIn()
  }
  const handlePremiumUnauth = () => {
    // show the sign-in modal instead of redirecting
    openSignIn()
  }

  return (
    <>
      {isPremiumUser ? (
        <div className="flex w-full flex-col items-center gap-4">
          <div className="rounded-2xl border border-yellow-300 bg-yellow-50 p-6 text-center max-w-3xl">
            <h3 className="text-xl font-semibold text-neutral-900">You're a Premium member</h3>
            <p className="mt-2 text-neutral-700">Enjoy unlimited downloads, AI summaries, and your full library — no action needed.</p>
          </div>
        </div>
      ) : (
        <>
          <PricingCard
            title="Free Tier"
            price={0}
            currency="₱"
            duration="/forever"
            description="Perfect for casual research and browsing"
            features={freeTierFeatures}
            buttonText={isAuthenticated ? 'Current plan' : 'Get Started Free'}
            buttonColor="bg-gray-900 hover:bg-gray-800"
            accentColor="text-green-600"
            disabled={isAuthenticated && !isPremiumUser}
            onButtonClick={handleFreeCTA}
          />

          <PricingClientWrapper
            isPremiumUser={isPremiumUser}
            isAuthenticated={isAuthenticated}
            premiumTierFeatures={premiumTierFeatures}
            onUnauthenticated={handlePremiumUnauth}
            showButton={true}
          />

          <SignupPromptModal isOpen={showSignIn} onClose={closeSignIn} />
        </>
      )}
    </>
  )
}
