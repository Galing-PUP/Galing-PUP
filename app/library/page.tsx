"use client";

import { BookmarkCard } from "@/components/library/bookmark-card";
import { BookmarkCardSkeleton } from "@/components/library/bookmark-card-skeleton";
import { PremiumBanner } from "@/components/library/premium-banner";
import { PremiumSection } from "@/components/library/premium-section";
import {
  LibrarySortDropdown,
  LibrarySortOption,
} from "@/components/library/sort-dropdown";
import { LibrarySearchInput } from "@/components/library/search-input";
import { useState, useMemo, useEffect } from "react";
import * as libraryService from "@/lib/services/libraryService";
import { toast } from "sonner";
import {
  NoSearchResultsState,
  EmptyLibraryState,
  LoggedOutState,
} from "@/components/library/empty-states";

import { createClient } from "@/lib/supabase/client";

import { BookmarkData } from "@/lib/services/libraryService";

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] =
    useState<LibrarySortOption>("bookmarked-newest");
  const [bookmarkedPapers, setBookmarkedPapers] = useState<BookmarkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [maxBookmarks, setMaxBookmarks] = useState<number | null>(10);
  const [tierName, setTierName] = useState("Free");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch bookmarked papers and user tier from API on mount only
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setIsAuthenticated(true);
          // Fetch both bookmarks and tier info in parallel
          const [bookmarks, tierResponse] = await Promise.all([
            libraryService.getDetailedBookmarks(),
            fetch(`/api/user/tier`),
          ]);

          setBookmarkedPapers(bookmarks);

          if (tierResponse.ok) {
            const tierData = await tierResponse.json();
            setMaxBookmarks(tierData.maxBookmarks);
            setTierName(tierData.tierName);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error fetching library data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter and sort papers
  const filteredPapers = useMemo(() => {
    // First, filter by search query
    let papers = bookmarkedPapers;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      papers = bookmarkedPapers.filter(
        (paper) =>
          paper.document.title.toLowerCase().includes(query) ||
          paper.document.authors.some((author: string) =>
            author.toLowerCase().includes(query)
          ) ||
          paper.document.course.toLowerCase().includes(query) ||
          paper.document.abstract.toLowerCase().includes(query)
      );
    }

    // Then, sort the filtered results
    const sorted = [...papers].sort((paperA, paperB) => {
      switch (sortOption) {
        case "title-asc":
          return paperA.document.title.localeCompare(paperB.document.title);
        case "title-desc":
          return paperB.document.title.localeCompare(paperA.document.title);
        case "date-newest": {
          const publishTimeA = new Date(
            paperA.document.datePublished
          ).getTime();
          const publishTimeB = new Date(
            paperB.document.datePublished
          ).getTime();
          return publishTimeB - publishTimeA;
        }
        case "date-oldest": {
          const publishTimeA = new Date(
            paperA.document.datePublished
          ).getTime();
          const publishTimeB = new Date(
            paperB.document.datePublished
          ).getTime();
          return publishTimeA - publishTimeB;
        }
        case "bookmarked-newest": {
          const bookmarkTimeA = new Date(paperA.dateBookmarked).getTime();
          const bookmarkTimeB = new Date(paperB.dateBookmarked).getTime();
          return bookmarkTimeB - bookmarkTimeA;
        }
        case "bookmarked-oldest": {
          const bookmarkTimeA = new Date(paperA.dateBookmarked).getTime();
          const bookmarkTimeB = new Date(paperB.dateBookmarked).getTime();
          return bookmarkTimeA - bookmarkTimeB;
        }
        default:
          return 0;
      }
    });

    return sorted;
  }, [bookmarkedPapers, searchQuery, sortOption]);

  // Handle bookmark removal
  const handleRemoveBookmark = async (documentId: number) => {
    const result = await libraryService.removeBookmark(documentId);
    return result;
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Header Section with Maroon Background */}
        <div className="bg-pup-maroon px-4 py-12 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white">My Library</h1>
                <p className="mt-2 text-lg text-gray-200">
                  Your bookmarked documents and saved research
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-white">
                  {bookmarkedPapers.length} / {maxBookmarks === null ? "∞" : maxBookmarks}
                </div>
                <p className="text-sm text-gray-200">Bookmarks Used</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          {/* Premium Banner - only show if limit is not null and reached */}
          {maxBookmarks !== null && bookmarkedPapers.length >= maxBookmarks && (
            <div className="mb-6">
              <PremiumBanner
                usedBookmarks={bookmarkedPapers.length}
                maxBookmarks={maxBookmarks}
              />
            </div>
          )}

          {/* Search and Sort Bar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <LibrarySearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              className="flex-1"
              disabled={!isAuthenticated || bookmarkedPapers.length === 0}
            />
            <LibrarySortDropdown 
              value={sortOption} 
              onChange={setSortOption} 
              disabled={!isAuthenticated || bookmarkedPapers.length === 0}
            />
          </div>

          {/* Bookmarked Papers */}
          {isLoading ? (
            <div className="space-y-4">
              <BookmarkCardSkeleton />
              <BookmarkCardSkeleton />
              <BookmarkCardSkeleton />
            </div>
          ) : filteredPapers.length > 0 ? (
            <div className="space-y-4">
              {filteredPapers.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.documentId}
                  result={{
                    id: bookmark.document.id,
                    title: bookmark.document.title,
                    authors: bookmark.document.authors,
                    field: bookmark.document.course,
                    college: bookmark.document.college,
                    year: new Date(
                      bookmark.document.datePublished
                    ).getFullYear(),
                    abstract: bookmark.document.abstract,
                    citations: bookmark.document.citationCount,
                    downloads: bookmark.document.downloadsCount,
                    type: bookmark.document.resourceType,
                    dateBookmarked: bookmark.dateBookmarked,
                  }}
                  removeBookmark={handleRemoveBookmark}
                  onRemove={() => {
                    // Remove card from local state immediately
                    setBookmarkedPapers((prev) =>
                      prev.filter((b) => b.documentId !== bookmark.documentId)
                    );
                    toast.success("Bookmark removed successfully");
                  }}
                  onError={(message) => toast.error(message)}
                />
              ))}
            </div>
          ) : isAuthenticated ? (
            searchQuery ? (
              <NoSearchResultsState onClear={() => setSearchQuery("")} />
            ) : (
              <EmptyLibraryState />
            )
          ) : (
            <LoggedOutState />
          )}

          {/* Premium Section */}
          {bookmarkedPapers.length > 0 && (
            <div className="mt-12">
              <PremiumSection />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
