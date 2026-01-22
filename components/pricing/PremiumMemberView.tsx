'use client'

import { Download, Star, Zap, BookOpen, Gift, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PremiumMemberViewProps {
  premiumTierFeatures: Array<{ name: string; included: boolean }>
}

export default function PremiumMemberView({
  premiumTierFeatures,
}: PremiumMemberViewProps) {
  const router = useRouter()

  const benefits = [
    {
      icon: <Download className="w-8 h-8" />,
      title: 'Unlimited Downloads',
      description: 'Download as many research papers as you need without daily limits',
      included: true,
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'AI-Generated Summaries',
      description: 'Get intelligent summaries and key insights from any paper',
      included: true,
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Unlimited Citations',
      description: 'Generate citations in any format without restrictions',
      included: true,
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Full Document Access',
      description: 'Read complete research papers with full-text search',
      included: true,
    },
    {
      icon: <Gift className="w-8 h-8" />,
      title: 'Unlimited Bookmarks',
      description: 'Save unlimited papers to your personal collection',
      included: true,
    },
    {
      icon: <Gift className="w-8 h-8" />,
      title: 'Research All You Want!',
      description: 'Enjoy unrestricted access to all research materials available',
      included: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-pup-maroon/5 to-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center space-y-6 bg-pup-maroon py-16 text-white">
        <div className="space-y-4 text-center">
          <div className="inline-block rounded-full bg-pup-gold-light/20 px-4 py-1">
            <span className="text-sm font-semibold text-pup-gold-light">Premium Member</span>
          </div>
          <h1 className="text-4xl font-bold">Welcome to Premium</h1>
          <p className="max-w-2xl text-lg text-white/80">
            You've unlocked unlimited access to advanced research tools and features. Here's what you can do now.
          </p>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-neutral-900">Your Premium Benefits</h2>
            <p className="mt-2 text-neutral-600">Everything included with your membership</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="rounded-2xl border border-neutral-200 bg-white p-6 transition-all hover:shadow-lg hover:border-pup-maroon/30"
              >
                <div className="mb-4 inline-block rounded-lg bg-pup-maroon/10 p-3 text-pup-maroon">
                  {benefit.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                  {benefit.title}
                </h3>
                <p className="text-neutral-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-pup-maroon/20 bg-gradient-to-r from-pup-maroon/5 to-pup-gold-light/5 p-8 text-center">
            <h3 className="text-2xl font-bold text-neutral-900">Ready to explore?</h3>
            <p className="mt-2 text-neutral-600">
              Head to your library to find and explore research papers with all your premium features.
            </p>
            <button
              onClick={() => router.push('/library')}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-pup-maroon px-6 py-3 font-semibold text-white transition hover:bg-pup-maroon/90"
            >
              Go to Your Library
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}
