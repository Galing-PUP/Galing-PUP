'use client'

/**
 * CitationModal Component
 *
 * A robust modal dialog for generating and copying academic citations in multiple formats.
 * Fetches citation data from the Citation API and provides copy-to-clipboard functionality.
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { CitationFormats } from '@/types/citation'
import { Check, Copy, Download, Loader2, Quote } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type CitationFormat = 'apa' | 'mla' | 'ieee' | 'acm' | 'chicago' | 'bibtex'

interface CitationModalProps {
  documentId: number
  isOpen: boolean
  onClose: () => void
}

/**
 * CitationModal component for displaying and copying academic citations
 * @param documentId - The ID of the document to generate citations for
 * @param isOpen - Controls modal visibility
 * @param onClose - Callback when modal is closed
 */
export function CitationModal({
  documentId,
  isOpen,
  onClose,
}: CitationModalProps) {
  const router = useRouter()
  const [citations, setCitations] = useState<CitationFormats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLimitError, setIsLimitError] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<CitationFormat>('apa')
  const [copiedFormat, setCopiedFormat] = useState<CitationFormat | null>(null)
  const [usage, setUsage] = useState<{
    used: number
    limit: number | null
    reset: string
  } | null>(null)

  // Citation format display names
  const formatLabels: Record<CitationFormat, string> = {
    apa: 'APA',
    mla: 'MLA',
    ieee: 'IEEE',
    acm: 'ACM',
    chicago: 'Chicago',
    bibtex: 'BibTeX',
  }

  /**
   * Fetches citation data from the API
   */
  const fetchCitations = async () => {
    setIsLoading(true)
    setError(null)
    setIsLimitError(false)
    let limitReached = false

    try {
      const response = await fetch(`/api/citations/${documentId}`)
      const result = await response.json()

      if (!response.ok) {
        // Check if it's a rate limit error (429 or 403)
        if (response.status === 429 || response.status === 403) {
          setIsLimitError(true)
          limitReached = true
        }
        throw new Error(result.error || 'Failed to generate citations')
      }

      if (result.success && result.data) {
        setCitations(result.data)
        // Set usage stats if available
        if (result.usage) {
          setUsage(result.usage)
        }
        // Refresh server components to update citation count
        router.refresh()
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load citations'
      setError(errorMessage)

      // Only show toast if it's NOT a limit error
      if (!limitReached) {
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Fetch citations when modal opens
   */
  useEffect(() => {
    if (isOpen && !citations) {
      fetchCitations()
    }
  }, [isOpen, documentId])

  /**
   * Copies citation to clipboard
   * @param format - The citation format to copy
   */
  const handleCopy = async (format: CitationFormat) => {
    if (!citations) return

    const citationText = citations[format]

    try {
      await navigator.clipboard.writeText(citationText)
      setCopiedFormat(format)
      toast.success(`${formatLabels[format]} citation copied to clipboard`)

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedFormat(null)
      }, 2000)
    } catch (err) {
      toast.error('Failed to copy citation')
    }
  }

  /**
   * Downloads BibTeX citation as a .bib file
   */
  const handleDownloadBib = () => {
    if (!citations) return

    const bibtexContent = citations.bibtex

    try {
      // Create a Blob with the BibTeX content
      const blob = new Blob([bibtexContent], { type: 'application/x-bibtex' })

      // Create a temporary anchor element
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `citation-${documentId}.bib`

      // Trigger download
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('BibTeX file downloaded')
    } catch (err) {
      toast.error('Failed to download BibTeX file')
    }
  }

  /**
   * Handles modal close and resets state
   */
  const handleClose = () => {
    onClose()
    // Reset state after animation completes
    setTimeout(() => {
      setSelectedFormat('apa')
      setCopiedFormat(null)
    }, 300)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl w-full max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <div className="p-6 pb-4 border-b shrink-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Quote className="h-5 w-5 text-pup-maroon" />
              Generate Citation
            </DialogTitle>
            <DialogDescription>
              Select a citation format and copy it to your clipboard
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-pup-maroon" />
              <p className="mt-4 text-sm text-gray-600">
                Generating citations...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
              {isLimitError ? (
                <Link
                  href="/pricing"
                  className="mt-3 inline-block rounded-md bg-pup-maroon px-4 py-2 text-sm font-medium text-white hover:bg-pup-maroon/90 transition-colors"
                >
                  Upgrade to Premium
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={fetchCitations}
                  className="mt-3 text-sm font-medium text-pup-maroon hover:underline"
                >
                  Try again
                </button>
              )}
            </div>
          )}

          {/* Citations Display */}
          {citations && !isLoading && (
            <div className="space-y-4">
              {/* Format Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Citation Format
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(formatLabels) as CitationFormat[]).map(
                    (format) => (
                      <button
                        key={format}
                        type="button"
                        onClick={() => setSelectedFormat(format)}
                        className={`rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
                          selectedFormat === format
                            ? 'bg-pup-maroon text-white border-pup-maroon'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {formatLabels[format]}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Citation Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Preview
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Download button - only visible for BibTeX */}
                    {selectedFormat === 'bibtex' && (
                      <button
                        type="button"
                        onClick={handleDownloadBib}
                        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-pup-maroon hover:bg-pup-maroon/10 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Download .bib
                      </button>
                    )}
                    {/* Copy button */}
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedFormat)}
                      className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-pup-maroon hover:bg-pup-maroon/10 transition-colors"
                    >
                      {copiedFormat === selectedFormat ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                    {citations[selectedFormat]}
                  </pre>
                </div>
              </div>

              {/* Usage Stats Footer */}
              {usage && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">
                        Daily Quota:
                      </span>
                      <span className="font-semibold text-pup-maroon">
                        {usage.used} /{' '}
                        {usage.limit === null ? 'Unlimited' : usage.limit}
                      </span>
                    </div>
                    <div className="text-gray-500 text-xs">
                      Resets at{' '}
                      {new Date(usage.reset).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZoneName: 'short',
                      })}
                    </div>
                  </div>
                  {/* Progress bar - only show if limit is not null */}
                  {usage.limit !== null && (
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-pup-maroon transition-all duration-300"
                        style={{
                          width: `${(usage.used / usage.limit) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                  {usage.limit !== null && usage.used >= usage.limit && (
                    <p className="mt-2 text-xs text-amber-600">
                      ℹ️ You've reached your daily limit for new citations. You
                      can still re-generate citations for documents you've
                      already cited today.
                    </p>
                  )}
                </div>
              )}

              {/* Correctness Disclaimer */}
              <div className="border-t pt-3 mt-4">
                <p className="text-xs text-gray-500 text-center">
                  <span className="font-medium">Note:</span> Citations are
                  generated automatically. Please verify format against your
                  institution's guidelines.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
