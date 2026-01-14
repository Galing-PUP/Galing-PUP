import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton loading state for BookmarkCard
 * Matches the structure and layout of the actual BookmarkCard component
 */
export function BookmarkCardSkeleton() {
  return (
    <div className="rounded-lg border-2 border-pup-gold-light bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        {/* Left Content */}
        <div className="flex-1 space-y-3">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          {/* Title */}
          <Skeleton className="h-6 w-3/4" />

          {/* Authors and Affiliation */}
          <Skeleton className="h-4 w-full" />

          {/* Stats */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex flex-col gap-2 md:shrink-0">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
