'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import { FilterBox, FilterValues } from '@/components/filter-box'
import { SearchBar } from '@/components/search-bar'
import { SearchResultCard } from '@/components/search-result-card'
import { SearchResultSkeletonList } from '@/components/search-result-skeleton'
import { SortDropdown } from '@/components/sort-dropdown'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { courses } from '@/data/collegeCourses'

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

function BrowsePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeSearchTerm = searchParams.get('q') ?? ''

  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(activeSearchTerm)
  const [filters, setFilters] = useState<FilterValues>({
    course: 'All Courses',
    yearRange: 'Anytime',
    documentType: 'All Types',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<
    'Newest to Oldest' | 'Oldest to Newest' | 'Title A-Z' | 'Title Z-A'
  >('Newest to Oldest')

  // Use static course data instead of fetching from API
  const courseOptions = courses.map((c) => c.courseName)

  const resultsPerPage = 10

  useEffect(() => {
    setSearchTerm(activeSearchTerm)
  }, [activeSearchTerm])

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

        const query = params.toString()
        const url = query ? `/api/browse?${query}` : '/api/browse'

        const res = await fetch(url)
        if (!res.ok) {
          throw new Error(`Failed to load results: ${res.status}`)
        }
        const data: SearchResult[] = await res.json()
        setResults(data)
        setCurrentPage(1)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [activeSearchTerm, filters, sortBy])

  const totalResults = results.length
  const totalPages = Math.ceil(totalResults / resultsPerPage) || 1
  const startResult =
    totalResults === 0 ? 0 : (currentPage - 1) * resultsPerPage + 1
  const endResult = Math.min(currentPage * resultsPerPage, totalResults)

  // Get paginated results
  const paginatedResults = results.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage,
  )

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
          />
        </div>

        {/* Main Content with Filters and Results */}
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-10 lg:gap-20 lg:flex-row">
            {/* Left Sidebar - Filters */}
            <aside className="w-full lg:w-64 md:w-72 lg:shrink-0 lg:pl-0 md:pl-0">
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
            <div className="flex-1 min-w-0 pr-6 md:pr-8">
              {/* Results Header */}
              <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-4 md:flex-row md:items-center">
                <p className="text-sm text-gray-600">
                  Showing {startResult}-{endResult} of{' '}
                  {totalResults.toLocaleString()} results
                </p>
                <SortDropdown value={sortBy} onChange={setSortBy} />
              </div>

              {/* Search Results List */}
              <div className="py-6">
                {loading ? (
                  <SearchResultSkeletonList count={resultsPerPage} />
                ) : (
                  paginatedResults.map((result) => (
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
