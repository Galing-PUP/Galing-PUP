'use client'

import { ShineBorder } from '@/components/ui/shine-border'
import { Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function AiInsights() {
  const router = useRouter()

  const handleUpgrade = useCallback(() => {
    router.push('/pricing')
  }, [router])

  return (
    <div className="relative overflow-hidden rounded-lg bg-white shadow-sm">
      <ShineBorder
        className="text-center text-2xl font-bold capitalize"
        shineColor={['#A07CFE', '#FE8FB5', '#FFBE7B']}
        borderWidth={2}
      />
      <div className="relative z-10 flex flex-col items-start p-6">
        <div className="flex w-full items-center gap-2">
          <Sparkles className="h-5 w-5 text-pup-maroon" />
          <h3
            id="ai-insights-heading"
            className="text-lg font-bold text-pup-maroon"
          >
            AI Insights
          </h3>
          <span className="rounded-full bg-pup-maroon px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Premium
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Advanced analysis and key trends
        </p>

        <div className="mt-6 w-full rounded-lg bg-gray-50 p-8 text-center">
          <p className="mx-auto max-w-md text-sm font-medium text-gray-500">
            Unlock detailed AI-powered insights, trend analysis, and research
            connections.
          </p>
          <button
            type="button"
            onClick={handleUpgrade}
            className="mt-4 rounded-md bg-pup-maroon px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-pup-maroon/90 focus:outline-none focus:ring-2 focus:ring-pup-maroon focus:ring-offset-2"
          >
            Upgrade to Premium
          </button>
        </div>
      </div>
    </div>
  )
}
