import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton component for SearchResultCard
 * Displays a loading placeholder that matches the structure of the actual search result card
 */
export function SearchResultSkeleton() {
  return (
    <div className="border-b border-gray-200 py-6 last:border-b-0">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 space-y-3">
          {/* Title skeleton */}
          <Skeleton className="h-7 w-3/4" />

          {/* Authors and details skeleton */}
          <div className="flex gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>

          {/* Abstract skeleton - 3 lines */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        {/* PDF link skeleton */}
        <div className="mt-3 md:mt-0 md:ml-4">
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  )
}

/**
 * Renders multiple skeleton cards for the browse page
 * @param count - Number of skeleton cards to display (default: 10)
 */
export function SearchResultSkeletonList({ count = 10 }: { count?: number }) {
  return (
    <div className="py-6">
      {Array.from({ length: count }).map((_, index) => (
        <SearchResultSkeleton key={index} />
      ))}
    </div>
  )
}
