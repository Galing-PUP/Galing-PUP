import { BenefitCard } from '@/components/pricing/benefit-card'
import { FAQCard } from '@/components/pricing/faq-card'
import { PricingCard } from '@/components/pricing/pricing-card'
import { PricingClientWrapper } from '@/components/pricing/pricing-client-wrapper'
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
        <section className="flex flex-col items-center justify-center space-y-6 bg-pup-maroon py-8 text-white">
          <span className="bg-white/20 rounded-full px-3 py-1 flex items-center gap-2">
            <Crown className="text-pup-gold-light w-4 h-4" /> Choose your plan
          </span>
          <h2 className="font-extrabold text-3xl text-white">
            Subscription Plans
          </h2>
          <div className="text-center">
            <p>
              Start with our free tier or unlock unlimited access with Premium.
            </p>
            <p>Choose the plan that fits your research needs.</p>
          </div>
        </section>
        {/* Pricing Cards Grid */}
        <section className="flex items-center justify-center gap-8 py-16 bg-white">
          {/* Free Tier Card */}
          <PricingCard
            title="Free Tier"
            price={0}
            currency="₱"
            duration="/forever"
            description="Perfect for casual research and browsing"
            features={freeTierFeatures}
            buttonText="Get Started Free"
            buttonColor="bg-gray-900 hover:bg-gray-800"
            accentColor="text-green-600"
            disabled={isPremiumUser}
          />

          {/* Premium Tier Card */}
          <PricingClientWrapper
            isPremiumUser={isPremiumUser}
            freeTierFeatures={freeTierFeatures}
            premiumTierFeatures={premiumTierFeatures}
          />
        </section>

        <section className="flex flex-col items-center justify-center bg-slate-100 text-black py-10 gap-y-4">
          <h2 className="font-extrabold text-3xl">Why Go Premium?</h2>
          <p>
            Unlock the full potential of GALING PUP with Premium features
            designed for serious researchers
          </p>
          {/* Grid for benefits cards */}
          <div className="flex items-center justify-center gap-8">
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

        <section className="flex flex-col items-center justify-center bg-white text-black py-10 gap-y-4">
          <h2 className="font-extrabold text-3xl">
            Frequently Asked Questions
          </h2>

          <div className="w-full max-w-4xl space-y-6">
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

        <section className="flex flex-col items-center justify-center bg-pup-maroon text-white py-10 gap-y-4">
          <Crown className="text-pup-gold-light w-10 h-10" />
          <h2 className="text-3xl">Ready to Upgrade?</h2>
          <p>
            Join hundreds of Premium members enjoying unlimited access to
            academic resources
          </p>
          {/* commenting the button below, since we don't plan to implement a 'free trial' program */}
          {/* <button>
            <span className="text-white flex items-center gap-2">
              <Crown className="text-yellow-400" /> Upgrade to Premium
            </span>
          </button> */}
        </section>
      </main>
    </div>
  )
}
