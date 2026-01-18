'use client'

import { useState } from 'react'

type AbstractProps = {
  text: string
}

/**
 * Abstract component displays paper abstract with truncation at ~15 lines
 * @param text - The abstract text to display
 * @returns JSX element with expandable abstract section
 */
export function Abstract({ text }: AbstractProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Calculate if text should be truncated (approximately 15 lines at standard line-height)
  // Using line-clamp-10 for Tailwind CSS
  const shouldTruncate = text.split('\n').length > 10 || text.length > 800

  return (
    <div className="space-y-3">
      <h2 id="abstract-heading" className="text-xl font-semibold text-gray-900">
        Abstract
      </h2>
      <div
        className={`leading-relaxed text-gray-700 ${isExpanded ? '' : 'line-clamp-10'}`}
      >
        <p>{text}</p>
      </div>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-sm font-medium text-pup-maroon hover:text-pup-gold-dark transition-colors"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}
