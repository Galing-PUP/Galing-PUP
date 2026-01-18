'use client'

import { ShineBorder } from '@/components/ui/shine-border'
import { Skeleton } from '@/components/ui/skeleton'
import { useAiInsightsStore } from '@/lib/store/ai-insights-store'
import { cn } from '@/lib/utils'
import { AiInsightResult } from '@/types/ai-insights'
import 'katex/dist/katex.min.css'
import { AlertCircle, Lock, Sparkles, StickyNote } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

interface AiInsightsProps {
  documentId: number
}

export function AiInsights({ documentId }: AiInsightsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isLocked, setIsLocked] = useState(false)

  // 1. Get store actions
  const { setSummaryData, setActiveCitationId, activeCitationId, summaryData } =
    useAiInsightsStore()

  useEffect(() => {
    setSummaryData(null)
    setActiveCitationId(null)

    async function fetchSummary() {
      try {
        setLoading(true)
        const res = await fetch(`/api/ai/summary/${documentId}`)

        if (res.status === 403) {
          setIsLocked(true)
          setLoading(false)
          return
        }

        if (res.ok) {
          const data = await res.json()
          if (data.summary) {
            try {
              const parsed = JSON.parse(data.summary) as AiInsightResult
              setSummaryData(parsed)
            } catch (e) {
              // Fallback logic
              setSummaryData({
                sections: {
                  methodology: '',
                  mechanism: '',
                  results: data.summary,
                  conclusion: '',
                },
                citations: [],
              })
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch summary', error)
      } finally {
        setLoading(false)
      }
    }

    if (documentId) {
      fetchSummary()
    }
  }, [documentId, setSummaryData, setActiveCitationId])

  const handleUpgrade = useCallback(() => {
    router.push('/pricing')
  }, [router])

  const renderSection = (title: string, content: string) => {
    if (!content) return null

    // 2. Pre-process text like [32] into [32](citation:32)
    // This forces them to be recognized as links by ReactMarkdown
    const processedContent = content.replace(
      /\[([0-9,\s]+)\]/g,
      (match, inner) => {
        const parts = inner
          .split(/[, ]+/)
          .map((s: string) => s.trim())
          .filter((s: string) => /^\d+$/.test(s))

        if (parts.length === 0) return match

        const links = parts.map((p: string) => `[${p}](citation:${p})`).join('')
        return `${links}`
      },
    )

    return (
      <div className="mb-8 last:mb-0">
        <h4 className="text-md font-bold text-gray-900 border-l-4 border-pup-maroon pl-3 mb-3 uppercase tracking-wide">
          {title}
        </h4>
        <div
          className={cn(
            'prose prose-sm max-w-none text-gray-700 prose-p:leading-relaxed prose-pre:p-0',
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              // 3. Intercept ALL links
              a: ({ node, href, children, ...props }) => {
                const childText = String(children)
                  .replace(/[\[\]]/g, '')
                  .trim()
                const isCitationScheme = href?.startsWith('citation:')
                // Also catch if the text is just a number (fallback)
                const isNumeric = /^\d+$/.test(childText)

                if (isCitationScheme || isNumeric) {
                  // Parse the ID safely
                  const index = isCitationScheme
                    ? parseInt(href?.split(':')[1] || '0')
                    : parseInt(childText)

                  const isActive = activeCitationId === index

                  return (
                    <button
                      onClick={(e) => {
                        e.preventDefault() // Stop navigation
                        e.stopPropagation()

                        // Update Store
                        setActiveCitationId(index)

                        // Optional: Scroll panel into view manually if needed
                        const panel =
                          document.getElementById('ai-reference-panel')
                        if (panel) {
                          // Slight delay to ensure state updates
                          setTimeout(() => {
                            panel.scrollIntoView({
                              behavior: 'smooth',
                              block: 'nearest',
                            })
                          }, 50)
                        }
                      }}
                      className={cn(
                        'inline-flex items-center justify-center font-bold transition-all duration-200 mx-0.5 align-baseline text-xs px-1.5 py-0.5 rounded cursor-pointer',
                        isActive
                          ? 'bg-pup-maroon text-white shadow-sm'
                          : 'bg-pup-maroon/10 text-pup-maroon hover:bg-pup-maroon/20',
                      )}
                      title={`Jump to citation ${index}`}
                    >
                      {index}
                    </button>
                  )
                }

                // Normal links render as usual
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pup-maroon hover:underline font-medium"
                    {...props}
                  >
                    {children}
                  </a>
                )
              },
            }}
          >
            {processedContent}
          </ReactMarkdown>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-lg bg-white shadow-sm border border-gray-100 min-h-[400px]">
      {isLocked && (
        <ShineBorder
          className="text-center text-2xl font-bold capitalize"
          shineColor={['#A07CFE', '#FE8FB5', '#FFBE7B']}
          borderWidth={2}
        />
      )}

      <div className="relative z-10 flex flex-col items-start p-6">
        <div className="flex flex-col w-full mb-6 border-b border-gray-100 pb-4">
          <div className="flex w-full items-center gap-2">
            <Sparkles className="h-5 w-5 text-pup-maroon" />
            <h3 className="text-lg font-bold text-pup-maroon">AI Insights</h3>
            <span className="ml-auto rounded-full bg-pup-maroon/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pup-maroon border border-pup-maroon/20">
              {isLocked ? 'Premium' : 'Beta'}
            </span>
          </div>
          <div className="flex items-start gap-1.5 mt-2 ml-1 text-gray-500">
            <StickyNote className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <p className="text-xs italic leading-tight">
              Note: This summary is generated by AI and may contain
              inaccuracies.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="w-full space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="h-8" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : isLocked ? (
          <div className="flex flex-col items-center justify-center w-full py-12 text-center">
            <div className="rounded-full bg-gray-100 p-4 mb-4">
              <Lock className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              Premium Feature
            </h4>
            <p className="max-w-xs text-sm text-gray-500 mb-6">
              Unlock detailed AI-powered insights, methodology analysis, and
              verified citations.
            </p>
            <button
              onClick={handleUpgrade}
              className="rounded-lg bg-pup-maroon px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-pup-maroon/90 shadow-sm"
            >
              Upgrade to Access
            </button>
          </div>
        ) : summaryData ? (
          <div className="w-full">
            {renderSection('Methodology', summaryData.sections.methodology)}
            {renderSection('Mechanism', summaryData.sections.mechanism)}
            {renderSection('Results', summaryData.sections.results)}
            {renderSection('Conclusion', summaryData.sections.conclusion)}

            {(!summaryData.citations || summaryData.citations.length === 0) && (
              <p className="text-xs text-gray-400 mt-8 italic">
                No specific citations found for this storage.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full py-12 text-center text-gray-500">
            <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
            <p>Please login to see the AI insights</p>
          </div>
        )}
      </div>
    </div>
  )
}
