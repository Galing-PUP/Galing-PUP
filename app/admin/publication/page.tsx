"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Pencil, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";

import SortDropdown from "@/components/sort-dropdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResourceTypes } from "@/lib/generated/prisma/enums";
import { formatResourceType } from "@/lib/utils/format";

// --- Types ---
type AdminPublication = {
  id: number;
  title: string;
  abstract: string;
  field: string;
  date: string;
  author: string;
  resourceType: ResourceTypes | null;
};

// --- Configuration ---
const UNKNOWN_AUTHOR_LABEL = "Unknown Author";
const ITEMS_PER_PAGE = 10;

type AdminFilterValues = {
  course: string;
  year: string;
  documentType: ResourceTypes | "All Types";
};

type AdminSortOption =
  | "Newest to Oldest"
  | "Oldest to Newest"
  | "Title A-Z"
  | "Title Z-A";

export default function AdminPublicationsPage() {
  const router = useRouter();

  // --- State ---
  const [publications, setPublications] = useState<AdminPublication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Sort State
  const [filters, setFilters] = useState<AdminFilterValues>({
    course: "All Courses",
    year: "All Years",
    documentType: "All Types",
  });
  const [sortBy, setSortBy] = useState<AdminSortOption>("Newest to Oldest");

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [publicationToDelete, setPublicationToDelete] = useState<AdminPublication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Data Loading ---
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/browse");
        if (!res.ok) {
          throw new Error(`Failed to load publications: ${res.status}`);
        }
        
        const data: {
          id: number;
          title: string;
          abstract: string;
          field: string;
          authors: string[];
          date: string;
          resourceType: string | null;
        }[] = await res.json();

        const mapped: AdminPublication[] = data.map((item) => {
          const primaryAuthor =
            item.authors && item.authors.length > 0
              ? item.authors[0]
              : UNKNOWN_AUTHOR_LABEL;

          return {
            id: item.id,
            title: item.title,
            abstract: item.abstract,
            author: primaryAuthor,
            field: item.field,
            date: item.date,
            resourceType: (item.resourceType as ResourceTypes | null) ?? null,
          };
        });

        setPublications(mapped);
      } catch (e) {
        console.error(e);
        setError("Failed to load publications from the database.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // --- Logic: Filtering & Sorting ---
  const filteredData = useMemo(() => {
    let data = publications;

    // Search
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      data = data.filter((pub) =>
        pub.title.toLowerCase().includes(lowerQuery) ||
        pub.field.toLowerCase().includes(lowerQuery) ||
        pub.author.toLowerCase().includes(lowerQuery)
      );
    }

    // Course Filter
    if (filters.course !== "All Courses") {
      data = data.filter((pub) => pub.field === filters.course);
    }

    // Year Filter
    if (filters.year !== "All Years") {
      data = data.filter((pub) => pub.date.includes(filters.year));
    }

    // Document Type Filter
    if (filters.documentType !== "All Types") {
      data = data.filter(
        (pub) => pub.resourceType === filters.documentType
      );
    }

    // Sort
    return [...data].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      switch (sortBy) {
        case "Oldest to Newest":
          return dateA - dateB;
        case "Title A-Z":
          return a.title.localeCompare(b.title);
        case "Title Z-A":
          return b.title.localeCompare(a.title);
        case "Newest to Oldest":
        default:
          return dateB - dateA;
      }
    });
  }, [publications, searchQuery, filters, sortBy]);

  // Extract unique courses for filter dropdown
  const courseOptions = useMemo(() => {
    const set = new Set<string>();
    for (const pub of publications) {
      if (pub.field) set.add(pub.field);
    }
    return Array.from(set).sort();
  }, [publications]);

  // --- Logic: Pagination ---
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // --- Logic: Actions ---
  const handleEdit = (id: number) => {
    router.push(`/admin/publication/edit/${id}`);
  };

  const handleDeleteClick = (pub: AdminPublication) => {
    setPublicationToDelete(pub);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!publicationToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/documents/${publicationToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete publication.");
      }

      setPublications((prev) => prev.filter((p) => p.id !== publicationToDelete.id));

      // Adjust pagination if needed
      if (currentData.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }

      setIsDeleteModalOpen(false);
      setPublicationToDelete(null);

      toast.success("Research deleted. The super admin will be notified about this deletion.");
    } catch (error) {
      console.error(error);
      alert("There was an error deleting this publication. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

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

      {/* --- Controls Section --- */}
      <div className="space-y-4 rounded-3xl bg-white shadow-lg ring-1 ring-pup-maroon/10 p-4 md:p-6">
        {/* Search Bar */}
        <div className="relative w-full rounded-2xl bg-pup-gold-light/20 ring-1 ring-pup-maroon/20 px-3 py-2">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-pup-maroon">
            <Search size={18} strokeWidth={1.75} />
          </div>
          <input
            type="text"
            placeholder="Search by title, author, or field..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="block w-full pl-14 pr-6 py-3 text-sm text-gray-900 bg-transparent rounded-full focus:border-pup-maroon focus:ring-2 focus:ring-pup-maroon/30 focus:outline-none transition-all"
          />
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <SortDropdown
              value={sortBy}
              onChange={(value) => {
                setSortBy(value as AdminSortOption);
                setCurrentPage(1);
              }}
              className="w-full md:w-56"
            />

            {/* Course Filter */}
            <Select
              value={filters.course}
              onValueChange={(value) => {
                setFilters((prev) => ({
                  ...prev,
                  course: value,
                }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-56 rounded-full border-pup-maroon/30 text-sm">
                <SelectValue placeholder="All Courses" />
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
                }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-40 rounded-full border-pup-maroon/30 text-sm">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Years">All Years</SelectItem>
                {Array.from(
                  new Set(
                    publications
                      .map((pub) => pub.date.split(" ").pop() || "")
                      .filter(Boolean)
                  )
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
                  documentType: value as ResourceTypes | "All Types",
                }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-44 rounded-full border-pup-maroon/30 text-sm">
                <SelectValue placeholder="All Types" />
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
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-xs md:ml-auto text-gray-600">
            <span className="inline-flex items-center justify-center rounded-full bg-pup-gold-light/70 px-3 py-1 text-[11px] font-semibold text-pup-maroon">
              {filteredData.length}
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-pup-maroon">
              results
            </span>
            <span className="text-[11px] text-gray-500">
              • Page {currentPage} of {Math.max(totalPages, 1)}
            </span>
          </div>
        </div>
      </div>

      {/* --- Data Grid --- */}
      <div className="rounded-3xl border border-pup-maroon/10 bg-white shadow-xl min-h-[400px]">
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
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {currentData.map((pub) => {
                const yearStr = pub.date.split(" ").pop(); // Simple extraction
                return (
                  <div
                    key={pub.id}
                    className="group flex h-full flex-col justify-between rounded-2xl border border-pup-maroon/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold text-gray-900 transition group-hover:text-pup-maroon">
                            {pub.title}
                          </h3>
                          <p className="text-xs font-semibold uppercase tracking-wide text-pup-maroon/70">
                            By {pub.author}
                          </p>
                          <p className="line-clamp-3 text-sm text-gray-700">
                            {pub.abstract || "No abstract provided."}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-pup-maroon/10 px-3 py-1 text-xs font-semibold text-pup-maroon">
                          {yearStr}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 pt-4 border-t border-pup-maroon/5">
                      <span className="inline-flex max-w-[70%] items-center rounded-full bg-pup-gold-light/80 px-4 py-1 text-xs font-semibold text-pup-maroon shadow-sm">
                        {pub.field || "Uncategorized"}
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
                );
              })}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-pup-maroon/20 bg-pup-gold-light/10 text-center">
              <span className="text-lg font-semibold text-gray-800">No publications found</span>
              <span className="text-sm text-gray-600">Try adjusting your filters or search.</span>
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition ${
                      currentPage === pageNum
                        ? "bg-pup-maroon text-white shadow-md"
                        : "text-pup-maroon hover:bg-pup-gold-light/50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
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
              This action cannot be undone. This will permanently remove the record from the database.
            </p>

            <div className="mb-8 rounded-xl bg-pup-gold-light/30 px-5 py-4 text-pup-maroon border border-pup-maroon/10">
              <span className="block text-xs font-bold uppercase tracking-wide opacity-70">Selected Research</span>
              <span className="block mt-1 font-bold text-lg leading-tight">{publicationToDelete.title}</span>
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
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}