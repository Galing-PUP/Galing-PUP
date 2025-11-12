"use client";

import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { FilterBox } from "@/components/Filter-Box";
import { SearchResultCard } from "@/components/SearchResultCard";
import { SortDropdown } from "@/components/Sort-Dropdown";
import { mockResults } from "@/data/mockResults";
import { useState } from "react";

export default function SearchResultsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"Newest to Oldest" | "Oldest to Newest" | "Most Relevant" | "Title A-Z" | "Title Z-A">("Newest to Oldest");
  const resultsPerPage = 10;
  const totalResults = mockResults.length;
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startResult = (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);
  
  // Get paginated results
  const paginatedResults = mockResults.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  // Calculate which page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 3;
    
    if (totalPages <= maxPagesToShow + 2) {
      // Show all pages if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= maxPagesToShow) {
        // Near the beginning
        for (let i = 2; i <= maxPagesToShow + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - maxPagesToShow + 1) {
        // Near the end
        pages.push("...");
        for (let i = totalPages - maxPagesToShow; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        {/* Search Bar Section */}
        <div className="mx-auto max-w-6xl px-4 pt-8 pb-6 md:px-8">
          <SearchBar
            placeholder="Search publications..."
            className="mx-auto max-w-4xl"
            size="sm"
          />
        </div>

        {/* Main Content with Filters and Results */}
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-10 lg:gap-20 lg:flex-row">
            {/* Left Sidebar - Filters */}
            <aside className="w-full lg:w-64 md:w-72 lg:flex-shrink-0 lg:pl-0 md:pl-0">
              <div className="sticky top-8">
                <FilterBox />
              </div>
            </aside>

            {/* Right Content - Results */}
            <div className="flex-1 min-w-0 pr-6 md:pr-8">
              {/* Results Header */}
              <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-4 md:flex-row md:items-center">
                <p className="text-sm text-gray-600">
                  Showing {startResult}-{endResult} of {totalResults.toLocaleString()}{" "}
                  results
                </p>
                <SortDropdown value={sortBy} onChange={setSortBy} />
              </div>

              {/* Search Results List */}
              <div className="py-6">
                {paginatedResults.map((result) => (
                  <SearchResultCard key={result.id} result={result} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pb-12 pt-6">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    &lt; Previous
                  </button>

                  {getPageNumbers().map((page, index) => {
                    if (page === "...") {
                      return (
                        <span key={`ellipsis-${index}`} className="px-2 text-sm text-gray-500">
                          ...
                        </span>
                      );
                    }
                    const pageNum = page as number;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? "bg-yellow-400 text-gray-900"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage >= totalPages}
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next &gt;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

