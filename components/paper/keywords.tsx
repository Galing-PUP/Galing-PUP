type KeywordsProps = {
  keywords: string[]
}

export function Keywords({ keywords }: KeywordsProps) {
  if (!keywords || keywords.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h2 id="keywords-heading" className="text-xl font-semibold text-gray-900">
        Keywords
      </h2>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword) => (
          <span
            key={keyword}
            className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800"
          >
            {keyword}
          </span>
        ))}
      </div>
    </div>
  )
}
