import { BenefitCard } from '@/components/pricing/benefit-card'
import { FAQCard } from '@/components/pricing/faq-card'
import PricingCardsClient from '@/components/pricing/pricing-cards-client'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { Crown, Download, Sparkles, Zap } from 'lucide-react'

export default async function PricingPage() {
  // Fetch user authentication and tier status
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isPremiumUser = false

  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { supabaseAuthId: user.id },
      include: { subscriptionTier: true },
    })
    isPremiumUser = dbUser?.subscriptionTier.tierName === 'PAID'
  }
  const isAuthenticated = !!user
  const freeTierFeatures = [
    { name: '10 downloads per day', included: true },
    { name: '10 citations per day', included: true },
    { name: 'Up to 10 bookmarks', included: true },
    { name: 'View abstracts', included: true },
    { name: 'Full document access', included: false },
    { name: 'AI-generated summaries', included: false },
  ]

  const premiumTierFeatures = [
    { name: 'Unlimited downloads', included: true },
    { name: 'Unlimited citations', included: true },
    { name: 'Unlimited bookmarks', included: true },
    { name: 'View abstracts', included: true },
    { name: 'Full document access', included: true },
    { name: 'AI-generated summaries', included: true },
  ]

  return (
    <div className="min-h-screen">
      <main>
        {!isPremiumUser && (
          <section className="flex flex-col items-center justify-center space-y-4 sm:space-y-6 bg-pup-maroon py-8 sm:py-12 px-4 text-white">
            <span className="bg-white/20 rounded-full px-3 py-1 flex items-center gap-2 text-sm sm:text-base">
              <Crown className="text-pup-gold-light w-4 h-4" /> Choose your plan
            </span>
            <h2 className="font-extrabold text-2xl sm:text-3xl md:text-4xl text-white text-center">
              Subscription Plans
            </h2>
            <div className="text-center max-w-2xl">
              <p className="text-sm sm:text-base">
                Start with our free tier or unlock unlimited access with Premium.
              </p>
              <p className="text-sm sm:text-base">Choose the plan that fits your research needs.</p>
            </div>
          </section>
        )}
        {/* Pricing Cards Grid / Premium View */}
        <section className={!isPremiumUser ? "py-8 sm:py-12 md:py-16 px-4 bg-white" : ""}>
          <PricingCardsClient
            isAuthenticated={isAuthenticated}
            isPremiumUser={isPremiumUser}
            freeTierFeatures={freeTierFeatures}
            premiumTierFeatures={premiumTierFeatures}
          />
        </section>

        {!isPremiumUser && (
          <>
            <section className="flex flex-col items-center justify-center bg-slate-100 text-black py-8 sm:py-12 md:py-16 px-4 gap-y-6">
              <h2 className="font-extrabold text-2xl sm:text-3xl md:text-4xl text-center">Why Go Premium?</h2>
              <p className="text-center max-w-2xl text-sm sm:text-base px-4">
                Unlock the full potential of GALING PUP with Premium features
                designed for serious researchers
              </p>
              {/* Grid for benefits cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full max-w-6xl px-4">
                <BenefitCard
                  icon={<Download className="w-8 h-8" />}
                  title="Unlimited Access"
                  description="Download as many papers as you need without daily limits"
                />
                <BenefitCard
                  icon={<Sparkles className="w-8 h-8" />}
                  title="AI Insights"
                  description="Get deep analysis and key findings from research papers"
                />
                <BenefitCard
                  icon={<Zap className="w-8 h-8" />}
                  title="Unlimited Citations"
                  description="Enjoy generating as many citations as you need"
                />
              </div>
            </section>

            <section className="flex flex-col items-center justify-center bg-white text-black py-8 sm:py-12 md:py-16 px-4 gap-y-6">
              <h2 className="font-extrabold text-2xl sm:text-3xl md:text-4xl text-center">
                Frequently Asked Questions
              </h2>

              <div className="w-full max-w-4xl space-y-4 sm:space-y-6 px-4">
                <FAQCard
                  question="What payment methods do you accept?"
                  answer="We accept credit cards, debit cards, and GCash for Premium subscriptions."
                />
                <FAQCard
                  question="Do I only need to purchase once?"
                  answer="Yes! It's a one-time payment that gives you lifetime access — no subscriptions, renewals, or hidden fees."
                />
                <FAQCard
                  question="Can I transfer my lifetime access to someone else?"
                  answer="Lifetime access is non-transferable and is tied to your account or email upon purchase."
                />
              </div>
            </section>

            <section className="flex flex-col items-center justify-center bg-pup-maroon text-white py-8 sm:py-12 md:py-16 px-4 gap-y-4">
              <Crown className="text-pup-gold-light w-8 h-8 sm:w-10 sm:h-10" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center">Ready to Upgrade?</h2>
              <p className="text-center max-w-2xl text-sm sm:text-base px-4">
                Join hundreds of Premium members enjoying unlimited access to
                academic resources
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
