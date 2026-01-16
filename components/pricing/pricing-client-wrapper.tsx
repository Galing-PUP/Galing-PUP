'use client'

import { PricingCard } from '@/components/pricing/pricing-card'
import { Crown } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface PricingFeature {
  name: string
  included: boolean
}

interface PricingClientWrapperProps {
  isPremiumUser: boolean
  freeTierFeatures?: PricingFeature[]
  premiumTierFeatures: PricingFeature[]
}

/**
 * Client wrapper for Premium Tier card to handle payment upgrade
 * @param isPremiumUser - Whether the current user is a premium user
 * @param premiumTierFeatures - Features for premium tier
 */
export function PricingClientWrapper({
  isPremiumUser,
  premiumTierFeatures,
}: PricingClientWrapperProps) {
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Handles premium tier upgrade by creating a payment session
   * and redirecting to Xendit payment page
   */
  const handlePremiumUpgrade = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/checkout', { method: 'POST' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment session')
      }

      // Redirect to Xendit payment page
      window.location.href = data.paymentUrl
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to create payment session',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PricingCard
      title="Premium Tier"
      price={299}
      currency="₱"
      duration="/forever"
      description="Best for active researchers and students"
      features={premiumTierFeatures}
      buttonText={isLoading ? 'Processing...' : 'Upgrade to Premium'}
      isRecommended={true}
      borderColor="border-yellow-400"
      buttonColor="bg-pup-maroon hover:bg-pup-maroon/80"
      accentColor="text-red-700"
      icon={<Crown className="text-pup-gold-light" />}
      disableButton={isPremiumUser}
      customBadgeText={
        isPremiumUser ? "You're now a Premium User" : 'RECOMMENDED'
      }
      onButtonClick={handlePremiumUpgrade}
    />
  )
}
