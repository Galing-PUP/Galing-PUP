import Link from 'next/link'

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

        {/* PDF Link */}
        <div className="mt-3 md:mt-0 md:ml-4">
          <a
            href={result.pdfUrl || '#'}
            className="text-sm font-medium text-[#6b0504] hover:text-[#4a0403] transition-colors"
          >
            [PDF]
          </a>
        </div>
      </div>
    </div>
  )
}

export default SearchResultCard
