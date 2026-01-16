import Link from 'next/link'
import { toast } from 'sonner'

import { sanitizeFilename } from '@/lib/utils'

type SearchResult = {
  id: number
  title: string
  authors: string[]
  authorEmails: string[]
  additionalAuthors: number
  field: string
  date: string
  abstract: string
  pdfUrl?: string
  downloadToken?: string
}

type SearchResultCardProps = {
  result: SearchResult
  className?: string
}

export function SearchResultCard({
  result,
  className = '',
}: SearchResultCardProps) {
  return (
    <div
      className={`border-b border-gray-200 py-6 last:border-b-0 ${className}`}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          {/* Title */}
          <Link href={`/paper/${result.id}`}>
            <h3 className="mb-2 text-lg font-bold text-red-900 hover:text-[#6b0504] transition-colors">
              {result.title}
            </h3>
          </Link>

          {/* Authors and Details */}
          <div className="mb-3 text-sm text-gray-600">
            <span>by </span>
            {result.authors.map((author, index) => (
              <span key={index}>
                <a
                  href={`mailto:${result.authorEmails[index]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#6b0504] transition-colors"
                >
                  {author}
                </a>
                {index < result.authors.length - 1 && ', '}
              </span>
            ))}
            {result.additionalAuthors > 0 && (
              <span>
                ,{' '}
                <a
                  href={`/paper/${result.id}`}
                  className="underline hover:text-[#6b0504] transition-colors"
                >
                  +{result.additionalAuthors} more authors
                </a>
              </span>
            )}
            <span>
              {' '}
              • {result.field} • {result.date}
            </span>
          </div>

          {/* Abstract */}
          <p className="text-sm leading-relaxed text-gray-700">
            {result.abstract}
          </p>
        </div>

        {/* PDF Download Button */}
        <div className="mt-3 md:mt-0 md:ml-4">
          <button
            onClick={async () => {
              if (!result.downloadToken) {
                toast.error('Please sign in to download documents')
                return
              }

              const toastId = toast.loading('Preparing download...')

              try {
                const res = await fetch(
                  `/api/pdf/${encodeURIComponent(result.downloadToken)}`,
                )

                if (!res.ok) {
                  if (res.status === 403) {
                    const text = await res.text()
                    throw new Error(
                      text || 'Access denied. Please check your subscription.',
                    )
                  }
                  if (res.status === 404) throw new Error('Document not found.')
                  throw new Error('Download failed.')
                }

                const blob = await res.blob()
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url

                // Try to get filename from header
                const contentDisposition = res.headers.get('Content-Disposition')
                let filename = result.title
                  ? `${sanitizeFilename(result.title)}.pdf`
                  : `document-${result.id}.pdf`

                if (contentDisposition) {
                  const match = contentDisposition.match(/filename="?([^"]+)"?/)
                  if (match && match[1]) {
                    // Sanitize filename from header to prevent malicious filenames
                    filename = sanitizeFilename(match[1])
                  }
                }

                a.download = filename
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)

                toast.dismiss(toastId)
                toast.success('Download started')
              } catch (error) {
                toast.dismiss(toastId)
                toast.error(
                  error instanceof Error
                    ? error.message
                    : 'An error occurred while downloading',
                )
              }
            }}
            className="text-sm font-medium text-[#6b0504] hover:text-[#4a0403] transition-colors cursor-pointer"
          >
            [PDF]
          </button>
        </div>
      </div>
    </div>
  )
}

export default SearchResultCard
