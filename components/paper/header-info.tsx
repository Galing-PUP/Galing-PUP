type HeaderInfoProps = {
  title: string
  authors: string[]
  authorEmails: string[]
  documentType: string
  yearPublished: string
  courseName: string
}

export function HeaderInfo({
  title,
  authors,
  authorEmails,
  documentType,
  yearPublished,
  courseName,
}: HeaderInfoProps) {
  return (
    <div className="space-y-4">
      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-pup-maroon px-3 py-1 text-xs font-semibold text-white">
          {documentType}
        </span>
        <span className="rounded-md bg-[#FFD700] px-3 py-1 text-xs font-semibold text-neutral-900">
          {yearPublished}
        </span>
        <span className="rounded-md border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
          {courseName}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-pup-maroon">{title}</h1>

      {/* Authors */}
      <p className="text-lg text-gray-500">
        {authors.map((author, index) => (
          <span key={index}>
            <a
              href={`mailto:${authorEmails[index]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-pup-maroon transition-colors"
            >
              {author}
            </a>
            {index < authors.length - 1 && ', '}
          </span>
        ))}
      </p>
    </div>
  )
}
