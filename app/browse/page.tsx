'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import { FilterBox, FilterValues } from '@/components/filter-box'
import { SearchBar } from '@/components/search-bar'
import { SearchResultCard } from '@/components/search-result-card'
import { SearchResultSkeletonList } from '@/components/search-result-skeleton'
import { SortDropdown } from '@/components/sort-dropdown'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { courses } from '@/data/collegeCourses'
import { Filter } from 'lucide-react'

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

function BrowsePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeSearchTerm = searchParams.get('q') ?? ''

  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(activeSearchTerm)
  const [totalResults, setTotalResults] = useState(0)
  const [suggestions, setSuggestions] = useState<SearchResult[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({
    course: 'All Courses',
    yearRange: 'Anytime',
    documentType: 'All Types',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<
    'Newest to Oldest' | 'Oldest to Newest' | 'Title A-Z' | 'Title Z-A'
  >('Newest to Oldest')

  // Calculate active filter count
  const activeFilterCount = Object.values(filters).filter(
    (value) => !value.startsWith('All') && value !== 'Anytime',
  ).length

  // Use static course data instead of fetching from API
  const courseOptions = courses.map((c) => c.courseName)

  const resultsPerPage = 10

  useEffect(() => {
    setSearchTerm(activeSearchTerm)
  }, [activeSearchTerm])

  // Fetch suggestions as user types (for autocomplete)
  useEffect(() => {
    let abort = false

    const fetchSuggestions = async () => {
      const trimmed = searchTerm.trim()
      if (!trimmed) {
        setSuggestions([])
        setLoadingSuggestions(false)
        return
      }

      setLoadingSuggestions(true)
      try {
        const params = new URLSearchParams()
        params.set('q', trimmed)
        params.set('limit', '5')
        const url = `/api/browse?${params.toString()}`

        const res = await fetch(url)
        if (!res.ok) {
          throw new Error(`Failed to fetch suggestions: ${res.status}`)
        }
        const data: { results: SearchResult[]; total: number } =
          await res.json()
        if (!abort) {
          setSuggestions(data.results ?? [])
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        if (!abort) {
          setSuggestions([])
        }
      } finally {
        if (!abort) {
          setLoadingSuggestions(false)
        }
      }
    }

    const handle = setTimeout(fetchSuggestions, 300)

    return () => {
      abort = true
      clearTimeout(handle)
    }
  }, [searchTerm])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params = new URLSearchParams()

        if (activeSearchTerm.trim().length > 0) {
          params.set('q', activeSearchTerm.trim())
        }

        if (filters.course !== 'All Courses') {
          params.set('course', filters.course)
        }
        if (filters.yearRange !== 'Anytime') {
          params.set('yearRange', filters.yearRange)
        }
        if (filters.documentType !== 'All Types') {
          params.set('documentType', filters.documentType)
        }

        params.set('sort', sortBy)
        params.set('limit', resultsPerPage.toString())
        params.set('page', currentPage.toString())

        const query = params.toString()
        const url = query ? `/api/browse?${query}` : '/api/browse'

        const res = await fetch(url)
        if (!res.ok) {
          throw new Error(`Failed to load results: ${res.status}`)
        }
        const data: { results: SearchResult[]; total: number } =
          await res.json()
        setResults(data.results ?? [])
        setTotalResults(data.total ?? 0)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [activeSearchTerm, filters, sortBy, currentPage, resultsPerPage])

  // Reset pagination when term or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeSearchTerm, filters, sortBy])

  const totalPages = Math.ceil(totalResults / resultsPerPage) || 1
  const startResult =
    totalResults === 0 ? 0 : (currentPage - 1) * resultsPerPage + 1
  const endResult = Math.min(currentPage * resultsPerPage, totalResults)

  // Calculate which page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxPagesToShow = 3

    if (totalPages <= maxPagesToShow + 2) {
      // Show all pages if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage <= maxPagesToShow) {
        // Near the beginning
        for (let i = 2; i <= maxPagesToShow + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - maxPagesToShow + 1) {
        // Near the end
        pages.push('...')
        for (let i = totalPages - maxPagesToShow; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // In the middle
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Search Bar Section */}
        <div className="mx-auto max-w-6xl px-4 pt-8 pb-6 md:px-8">
          <SearchBar
            placeholder="Search publications..."
            className="mx-auto max-w-4xl"
            size="sm"
            value={searchTerm}
            onChange={setSearchTerm}
            onSubmit={() => {
              const trimmed = searchTerm.trim()
              const params = new URLSearchParams(searchParams.toString())
              if (trimmed) {
                params.set('q', trimmed)
              } else {
                params.delete('q')
              }
              const query = params.toString()
              router.push(`/browse${query ? `?${query}` : ''}`)
            }}
            suggestions={suggestions}
            loadingSuggestions={loadingSuggestions}
            onSelectSuggestion={(item) => {
              router.push(`/paper/${item.id}`)
            }}
          />
        </div>

        {/* Main Content with Filters and Results */}
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-10 lg:gap-20 lg:flex-row">
            {/* Left Sidebar - Filters (Desktop only) */}
            <aside className="hidden lg:block w-full lg:w-64 lg:shrink-0">
              <div className="sticky top-8">
                <FilterBox
                  variant="sidebar"
                  courseOptions={courseOptions}
                  defaultExpanded
                  onChange={(next) => {
                    setFilters(next)
                  }}
                />
              </div>
            </aside>

            {/* Right Content - Results */}
            <div className="flex-1 min-w-0 px-4 md:pr-8">
              {/* Results Header */}
              <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-4 md:flex-row md:items-center">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <p className="text-sm text-gray-600">
                    Showing {startResult}-{endResult} of{' '}
                    {totalResults.toLocaleString()} results
                  </p>
                  {/* Mobile Filter Button */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="lg:hidden ml-auto"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                        {activeFilterCount > 0 && (
                          <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-pup-maroon text-xs text-white">
                            {activeFilterCount}
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterBox
                          variant="sidebar"
                          courseOptions={courseOptions}
                          defaultExpanded
                          onChange={(next) => {
                            setFilters(next)
                          }}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
                <SortDropdown value={sortBy} onChange={setSortBy} />
              </div>

              {/* Search Results List */}
              <div className="py-6">
                {loading ? (
                  <SearchResultSkeletonList count={resultsPerPage} />
                ) : (
                  results.map((result) => (
                    <SearchResultCard key={result.id} result={result} />
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pb-12 pt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (currentPage > 1) setCurrentPage(currentPage - 1)
                          }}
                          className={
                            currentPage === 1
                              ? 'pointer-events-none opacity-50'
                              : ''
                          }
                        />
                      </PaginationItem>

                      {getPageNumbers().map((page, index) => {
                        if (page === '...') {
                          return (
                            <PaginationItem key={`ellipsis-${index}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )
                        }
                        const pageNum = page as number
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              href="#"
                              isActive={currentPage === pageNum}
                              onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage(pageNum)
                              }}
                              className={
                                currentPage === pageNum
                                  ? 'bg-pup-gold-light text-pup-maroon border-pup-gold-light hover:bg-pup-gold-light hover:text-pup-maroon'
                                  : ''
                              }
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      })}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (currentPage < totalPages)
                              setCurrentPage(currentPage + 1)
                          }}
                          className={
                            currentPage >= totalPages
                              ? 'pointer-events-none opacity-50'
                              : ''
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<SearchResultSkeletonList count={10} />}>
      <BrowsePageContent />
    </Suspense>
  )
}
