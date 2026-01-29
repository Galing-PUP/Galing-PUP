'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { regenerateSummary } from '@/lib/actions/summary'
import { cn } from '@/lib/utils'
import { AiInsightResult } from '@/types/ai-insights'
import 'katex/dist/katex.min.css'
import { Lock, RefreshCw, Sparkles, StickyNote } from 'lucide-react'
import { useState, useTransition } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { toast } from 'sonner'

interface AiSummarySectionProps {
  summary: string | null
  documentId: number
  canRegenerate: boolean
}

export function AiSummarySection({
  summary,
  documentId,
  canRegenerate,
}: AiSummarySectionProps) {
  const [isPending, startTransition] = useTransition()

  // Use local state to show optimistic updates or the new summary after regeneration
  // If prop summary changes, we might want to respect it, but for now just use what we have
  const [currentSummary, setCurrentSummary] = useState(summary)

  const handleRegenerate = () => {
    if (!canRegenerate) return

    startTransition(async () => {
      const toastId = toast.loading('Regenerating AI Summary...')
      try {
        const result = await regenerateSummary(documentId)

        if (result.success && result.summary) {
          setCurrentSummary(result.summary)
          toast.success('Summary regenerated successfully!', { id: toastId })
        } else {
          toast.error(result.error || 'Failed to regenerate summary', {
            id: toastId,
          })
        }
      } catch (error) {
        toast.error('An unexpected error occurred', { id: toastId })
        console.error(error)
      }
    })
  }

  const renderSection = (title: string, content: string) => {
    if (!content) return null

    // Pre-process text like [32] into [32](citation:32)
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
      <div className="mb-6 last:mb-0">
        <h4 className="text-sm font-bold text-gray-900 border-l-4 border-pup-maroon pl-3 mb-2 uppercase tracking-wide">
          {title}
        </h4>
        <div className="prose prose-sm max-w-none text-gray-700 prose-p:leading-relaxed prose-pre:p-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              a: ({ node, href, children, ...props }) => {
                const childText = String(children)
                  .replace(/[\[\]]/g, '')
                  .trim()
                const isCitationScheme = href?.startsWith('citation:')
                const isNumeric = /^\d+$/.test(childText)

                if (isCitationScheme || isNumeric) {
                  const index = isCitationScheme
                    ? parseInt(href?.split(':')[1] || '0')
                    : parseInt(childText)

                  return (
                    <span
                      className="inline-flex items-center justify-center font-bold mx-0.5 align-baseline text-xs px-1.5 py-0.5 rounded bg-pup-maroon/10 text-pup-maroon"
                      title={`Citation ${index}`}
                    >
                      {index}
                    </span>
                  )
                }

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

  // Parse sections
  let parsedSummary: AiInsightResult | null = null
  if (currentSummary) {
    try {
      parsedSummary = JSON.parse(currentSummary) as AiInsightResult
    } catch (e) {
      // Fallback if not JSON
      parsedSummary = {
        sections: {
          methodology: '',
          mechanism: '',
          results: currentSummary,
          conclusion: '',
        },
        citations: [],
      }
    }
  }

  return (
    <Card>
      <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50 flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pup-maroon/10 rounded-lg">
            <Sparkles className="h-5 w-5 text-pup-maroon" />
          </div>
          <div>
            <CardTitle className="text-lg">AI Summary</CardTitle>
            <CardDescription className="text-xs">
              Generated insights and analysis
            </CardDescription>
          </div>
        </div>
        <div>
          {canRegenerate ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={isPending}
              className="gap-2"
            >
              <RefreshCw
                className={cn('h-3.5 w-3.5', isPending && 'animate-spin')}
              />
              {isPending ? 'Regenerating...' : 'Regenerate AI Summary'}
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground italic flex items-center gap-1">
              <Lock className="h-3 w-3" /> Read-only
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="relative">
          {/* Note Banner */}
          <div className="flex items-start gap-1.5 mb-6 text-gray-500 bg-gray-50 p-3 rounded-md border border-gray-100">
            <StickyNote className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <p className="text-xs italic leading-tight">
              Note: This summary is generated by AI and may contain
              inaccuracies.
              {canRegenerate &&
                ' Use the regenerate button to refresh insights.'}
            </p>
          </div>

          {parsedSummary ? (
            <div className="w-full max-h-[500px] overflow-y-auto pr-2">
              {renderSection('Methodology', parsedSummary.sections.methodology)}
              {renderSection('Mechanism', parsedSummary.sections.mechanism)}
              {renderSection('Results', parsedSummary.sections.results)}
              {renderSection('Conclusion', parsedSummary.sections.conclusion)}

              {(!parsedSummary.citations ||
                parsedSummary.citations.length === 0) && (
                <p className="text-xs text-gray-400 mt-4 italic">
                  No specific citations found/parsed.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
              <Sparkles className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">No AI summary available.</p>
              {canRegenerate && (
                <Button
                  variant="link"
                  onClick={handleRegenerate}
                  disabled={isPending}
                >
                  Generate Now
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
