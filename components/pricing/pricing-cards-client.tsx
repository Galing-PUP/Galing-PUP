'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import PremiumMemberView from './PremiumMemberView'
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
        <PremiumMemberView premiumTierFeatures={premiumTierFeatures} />
      ) : (
        <>
          <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-8 max-w-5xl mx-auto">
            <div className="flex-1 max-w-md mx-auto md:mx-0 w-full">
              <PricingCard
                title="Free Tier"
                price={0}
                currency="₱"
                duration="/forever"
                description="Perfect for casual research and browsing"
                features={freeTierFeatures}
                buttonText={
                  isAuthenticated ? 'Current plan' : 'Get Started Free'
                }
                buttonColor="bg-gray-900 hover:bg-gray-800"
                accentColor="text-green-600"
                disabled={isAuthenticated && !isPremiumUser}
                onButtonClick={handleFreeCTA}
              />
            </div>

            <div className="flex-1 max-w-md mx-auto md:mx-0 w-full">
              <PricingClientWrapper
                isPremiumUser={isPremiumUser}
                isAuthenticated={isAuthenticated}
                premiumTierFeatures={premiumTierFeatures}
                onUnauthenticated={handlePremiumUnauth}
                showButton={true}
              />
            </div>
          </div>

          <SignupPromptModal isOpen={showSignIn} onClose={closeSignIn} />
        </>
      )}
    </>
  )
}
