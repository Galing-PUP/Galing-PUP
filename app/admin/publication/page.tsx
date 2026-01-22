'use client'

import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List as ListIcon,
  Pencil,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import SortDropdown from '@/components/sort-dropdown'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ResourceTypes } from '@/lib/generated/prisma/enums'
import { formatResourceType } from '@/lib/utils/format'

// --- Types ---
type AdminPublication = {
  id: number
  title: string
  abstract: string
  field: string
  date: string
  author: string
  resourceType: ResourceTypes | null
  status: string
}

// --- Configuration ---
const UNKNOWN_AUTHOR_LABEL = 'Unknown Author'
const ITEMS_PER_PAGE = 12

type AdminFilterValues = {
  course: string
  year: string
  documentType: ResourceTypes | 'All Types'
  status: string
}

type AdminSortOption =
  | 'Newest to Oldest'
  | 'Oldest to Newest'
  | 'Title A-Z'
  | 'Title Z-A'

export default function AdminPublicationsPage() {
  const router = useRouter()

  // --- State ---
  const [publications, setPublications] = useState<AdminPublication[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter & Sort State
  const [filters, setFilters] = useState<AdminFilterValues>({
    course: 'All Courses',
    year: 'All Years',
    documentType: 'All Types',
    status: 'All Statuses',
  })
  const [totalResults, setTotalResults] = useState(0)
  const [sortBy, setSortBy] = useState<AdminSortOption>('Newest to Oldest')
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [publicationToDelete, setPublicationToDelete] =
    useState<AdminPublication | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // --- Data Loading with Server-Side Pagination ---
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()

        if (searchQuery.trim()) {
          params.set('q', searchQuery.trim())
        }
        if (filters.course !== 'All Courses') {
          params.set('course', filters.course)
        }
        if (filters.year !== 'All Years') {
          params.set('year', filters.year)
        }
        if (filters.documentType !== 'All Types') {
          params.set('documentType', filters.documentType)
        }
        if (filters.status !== 'All Statuses') {
          params.set('status', filters.status)
        }
        params.set('sort', sortBy)
        params.set('limit', ITEMS_PER_PAGE.toString())
        params.set('page', currentPage.toString())

        const url = `/api/admin/publications?${params.toString()}`
        const res = await fetch(url)
        if (!res.ok) {
          throw new Error(`Failed to load publications: ${res.status}`)
        }

        const payload: {
          results: AdminPublication[]
          total: number
        } = await res.json()

        setPublications(payload.results ?? [])
        setTotalResults(payload.total ?? 0)
      } catch (e) {
        console.error(e)
        setError('Failed to load publications from the database.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [searchQuery, filters, sortBy, currentPage])

  // --- Reset pagination when filters change ---
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filters, sortBy])

  // Extract unique courses for filter dropdown
  const courseOptions = useMemo(() => {
    const set = new Set<string>()
    for (const pub of publications) {
      if (pub.field) set.add(pub.field)
    }
    return Array.from(set).sort()
  }, [publications])

  // --- Logic: Pagination ---
  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE) || 1
  const currentData = publications

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  // --- Logic: Actions ---
  const handleEdit = (id: number) => {
    router.push(`/admin/publication/edit/${id}`)
  }

  const handleDeleteClick = (pub: AdminPublication) => {
    setPublicationToDelete(pub)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!publicationToDelete || isDeleting) return

    setIsDeleting(true)
    try {
      const res = await fetch(
        `/api/admin/documents/${publicationToDelete.id}`,
        {
          method: 'DELETE',
        },
      )

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to delete publication.')
      }

      setPublications((prev) =>
        prev.filter((p) => p.id !== publicationToDelete.id),
      )

      // Adjust pagination if needed
      if (currentData.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1)
      }

      setIsDeleteModalOpen(false)
      setPublicationToDelete(null)

      toast.success(
        'Research deleted. The super admin will be notified about this deletion.',
      )
    } catch (error) {
      console.error(error)
      alert('There was an error deleting this publication. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div className="relative space-y-8 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-semibold text-pup-maroon">
            Welcome to the Publication Portal!
          </h1>
        </div>
        <p className="text-gray-600">
          Search, review, and manage approved research. Use the filters below to
          find items and keep records up to date.
        </p>
      </div>

      {/* --- Data Toolbar --- */}
      <div className="flex flex-col items-stretch gap-4 w-full md:flex-row md:items-center md:justify-between">
        {/* Search Input - Flexible on desktop */}
        <div className="relative w-full md:flex-1 md:max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            size={16}
          />
          <input
            type="text"
            placeholder="Search by title, author, or field..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full h-10 pl-9 pr-4 text-sm border border-gray-300 rounded-lg focus:border-pup-maroon focus:ring-2 focus:ring-pup-maroon/20 focus:outline-none transition-all"
          />
        </div>

        {/* Filters & Actions Container */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Sort Dropdown */}
          <SortDropdown
            value={sortBy}
            onChange={(value) => {
              setSortBy(value as AdminSortOption)
              setCurrentPage(1)
            }}
            className="w-auto min-w-0 [&_button]:rounded-lg [&_button]:h-10"
          />

          {/* Status Filter */}
          <Select
            value={filters.status}
            onValueChange={(value) => {
              setFilters((prev) => ({
                ...prev,
                status: value,
              }))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-auto h-10 rounded-lg border-gray-300 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Statuses">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="DELETED">Deleted</SelectItem>
            </SelectContent>
          </Select>

          {/* Course Filter */}
          <Select
            value={filters.course}
            onValueChange={(value) => {
              setFilters((prev) => ({
                ...prev,
                course: value,
              }))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-auto h-10 rounded-lg border-gray-300 text-sm">
              <SelectValue placeholder="Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Courses">All Courses</SelectItem>
              {courseOptions.map((course) => (
                <SelectItem key={course} value={course}>
                  {course}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year Filter */}
          <Select
            value={filters.year}
            onValueChange={(value) => {
              setFilters((prev) => ({
                ...prev,
                year: value,
              }))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-auto h-10 rounded-lg border-gray-300 text-sm">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Years">All Years</SelectItem>
              {Array.from(
                new Set(
                  publications
                    .map((pub) => pub.date.split(' ').pop() || '')
                    .filter(Boolean),
                ),
              )
                .sort()
                .map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Document Type Filter */}
          <Select
            value={filters.documentType}
            onValueChange={(value) => {
              setFilters((prev) => ({
                ...prev,
                documentType: value as ResourceTypes | 'All Types',
              }))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-auto h-10 rounded-lg border-gray-300 text-sm">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Types">All Types</SelectItem>
              {Object.values(ResourceTypes).map((type) => (
                <SelectItem key={type} value={type}>
                  {formatResourceType(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Divider */}
          <div className="hidden md:block h-6 w-px bg-gray-300" />

          {/* Results Count - Desktop Only */}
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-600">
            <span className="font-semibold text-pup-maroon">{totalResults}</span>
            <span className="text-gray-500">results</span>
          </div>

          {/* View Mode Toggle */}
          <div className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white p-1">
            <button
              type="button"
              onClick={() => setViewMode('card')}
              className={`flex h-8 w-8 items-center justify-center rounded transition ${viewMode === 'card'
                ? 'bg-pup-maroon text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
              aria-label="Card view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex h-8 w-8 items-center justify-center rounded transition ${viewMode === 'list'
                ? 'bg-pup-maroon text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
              aria-label="List view"
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* --- Data Grid --- */}
      <div className="rounded-3xl border border-pup-maroon/10 bg-white shadow-xl min-h-100">
        <div className="p-4 md:p-6">
          {loading ? (
            <div className="flex h-64 items-center justify-center text-gray-500">
              Loading publications...
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center text-red-600">
              {error}
            </div>
          ) : currentData.length > 0 ? (
            <>
              {viewMode === 'card' ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {currentData.map((pub) => {
                    const yearStr = pub.date.split(' ').pop() // Simple extraction
                    return (
                      <div
                        key={pub.id}
                        className="group flex h-full flex-col justify-between rounded-2xl border border-pup-maroon/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold text-gray-900 transition group-hover:text-pup-maroon">
                                  {pub.title}
                                </h3>
                              </div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-pup-maroon/70">
                                By {pub.author}
                              </p>
                              <p className="line-clamp-3 text-sm text-gray-700">
                                {pub.abstract || 'No abstract provided.'}
                              </p>
                            </div>
                            <div className="flex shrink-0 flex-col gap-2 items-end">
                              <span className="rounded-full bg-pup-maroon/10 px-3 py-1 text-xs font-semibold text-pup-maroon">
                                {yearStr}
                              </span>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${pub.status === 'APPROVED'
                                    ? 'bg-green-100 text-green-700'
                                    : pub.status === 'PENDING'
                                      ? 'bg-amber-100 text-amber-700'
                                      : pub.status === 'REJECTED'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-100 text-gray-700'
                                  }`}
                              >
                                {pub.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 pt-4 border-t border-pup-maroon/5">
                          <span className="inline-flex max-w-[70%] items-center rounded-full bg-pup-gold-light/80 px-4 py-1 text-xs font-semibold text-pup-maroon shadow-sm">
                            {pub.field || 'Uncategorized'}
                          </span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleEdit(pub.id)}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-pup-maroon/20 text-pup-maroon transition hover:border-pup-maroon hover:bg-pup-maroon/10"
                              aria-label="Edit publication"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(pub)}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-pup-maroon/20 text-pup-maroon transition hover:border-pup-maroon hover:bg-pup-maroon/10"
                              aria-label="Delete publication"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {currentData.map((pub) => {
                    const yearStr = pub.date.split(' ').pop() // Simple extraction
                    return (
                      <div
                        key={pub.id}
                        className="group flex items-center justify-between gap-4 rounded-2xl border border-pup-maroon/10 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-sm font-semibold text-gray-900 group-hover:text-pup-maroon">
                              {pub.title}
                            </h3>
                            <span className="inline-flex items-center rounded-full bg-pup-maroon/10 px-2 py-0.5 text-[10px] font-semibold text-pup-maroon">
                              {yearStr}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${pub.status === 'APPROVED'
                                  ? 'bg-green-100 text-green-700'
                                  : pub.status === 'PENDING'
                                    ? 'bg-amber-100 text-amber-700'
                                    : pub.status === 'REJECTED'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-700'
                                }`}
                            >
                              {pub.status}
                            </span>
                          </div>
                          <p className="truncate text-xs text-gray-600">
                            By <span className="font-medium">{pub.author}</span>{' '}
                            •{' '}
                            <span className="text-gray-500">
                              {pub.field || 'Uncategorized'}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleEdit(pub.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-pup-maroon/20 text-pup-maroon transition hover:border-pup-maroon hover:bg-pup-maroon/10"
                            aria-label="Edit publication"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(pub)}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-pup-maroon/20 text-pup-maroon transition hover:border-pup-maroon hover:bg-pup-maroon/10"
                            aria-label="Delete publication"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-pup-maroon/20 bg-pup-gold-light/10 text-center">
              <span className="text-lg font-semibold text-gray-800">
                No publications found
              </span>
              <span className="text-sm text-gray-600">
                Try adjusting your filters or search.
              </span>
            </div>
          )}
        </div>

        {/* --- Pagination Controls --- */}
        {totalPages > 0 && (
          <div className="border-t border-pup-maroon/10 bg-gray-50/50 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-pup-maroon transition hover:bg-pup-gold-light/30 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft size={16} /> <span>Previous</span>
              </button>

              <div className="flex items-center justify-center gap-2 overflow-x-auto px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition ${currentPage === pageNum
                        ? 'bg-pup-maroon text-white shadow-md'
                        : 'text-pup-maroon hover:bg-pup-gold-light/50'
                        }`}
                    >
                      {pageNum}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-pup-maroon transition hover:bg-pup-gold-light/30 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <span>Next</span> <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- Delete Modal --- */}
      {isDeleteModalOpen && publicationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-pup-maroon/10 zoom-in-95 duration-200"
            role="dialog"
          >
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 transition-colors hover:text-gray-700"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>

            <h2 className="mb-2 text-3xl font-extrabold text-pup-maroon">
              Delete research?
            </h2>
            <p className="mb-6 text-base leading-relaxed text-gray-600">
              This action cannot be undone. This will permanently remove the
              record from the database.
            </p>

            <div className="mb-8 rounded-xl bg-pup-gold-light/30 px-5 py-4 text-pup-maroon border border-pup-maroon/10">
              <span className="block text-xs font-bold uppercase tracking-wide opacity-70">
                Selected Research
              </span>
              <span className="block mt-1 font-bold text-lg leading-tight">
                {publicationToDelete.title}
              </span>
            </div>

            <div className="flex items-center justify-end gap-4">
              <button
                onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="text-sm font-semibold text-pup-maroon underline-offset-4 hover:underline disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="rounded-full bg-pup-maroon px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-pup-maroon/90 disabled:opacity-70 flex items-center gap-2"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
