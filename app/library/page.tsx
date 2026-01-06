"use client";


import { BookmarkCard } from "@/components/library/bookmark-card";
import { PremiumBanner } from "@/components/library/premium-banner";
import { PremiumSection } from "@/components/library/premium-section";
import { LibrarySortDropdown, LibrarySortOption } from "@/components/library/sort-dropdown";
import { LibrarySearchInput } from "@/components/library/search-input";
import { useState, useMemo, useEffect } from "react";
import * as libraryService from "@/lib/services/libraryService";
import { toast } from "sonner";

interface BookmarkedPaper {
  documentId: number;
  dateBookmarked: string;
  document: {
    id: number;
    title: string;
    abstract: string;
    datePublished: string;
    downloadsCount: number;
    citationCount: number;
    authors: string[];
    course: string;
    college: string;
    resourceType: string;
    filePath: string;
  };
}

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<LibrarySortOption>("bookmarked-newest");
  const [bookmarkedPapers, setBookmarkedPapers] = useState<BookmarkedPaper[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [maxBookmarks, setMaxBookmarks] = useState(10);
  const [tierName, setTierName] = useState("Free");

  // Fetch bookmarked papers and user tier from API on mount only
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
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
            author.toLowerCase().includes(query),
          ) ||
          paper.document.course.toLowerCase().includes(query) ||
          paper.document.abstract.toLowerCase().includes(query),
      );
    }

    // Then, sort the filtered results
    const sorted = [...papers].sort((a, b) => {
      switch (sortOption) {
        case "title-asc":
          return a.document.title.localeCompare(b.document.title);
        case "title-desc":
          return b.document.title.localeCompare(a.document.title);
        case "date-newest":
          return new Date(b.document.datePublished).getTime() - new Date(a.document.datePublished).getTime();
        case "date-oldest":
          return new Date(a.document.datePublished).getTime() - new Date(b.document.datePublished).getTime();
        case "bookmarked-newest": {
          const dateA = new Date(a.dateBookmarked).getTime();
          const dateB = new Date(b.dateBookmarked).getTime();
          return dateB - dateA;
        }
        case "bookmarked-oldest": {
          const dateA = new Date(a.dateBookmarked).getTime();
          const dateB = new Date(b.dateBookmarked).getTime();
          return dateA - dateB;
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
        <div className="bg-[#6b0504] px-4 py-12 md:px-8">
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
                  {bookmarkedPapers.length} / {maxBookmarks}
                </div>
                <p className="text-sm text-gray-200">Bookmarks Used</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          {/* Premium Banner */}
          {bookmarkedPapers.length >= maxBookmarks && (
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
            />
            <LibrarySortDropdown value={sortOption} onChange={setSortOption} />
          </div>

          {/* Bookmarked Papers */}
          {isLoading ? (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p className="text-lg font-medium text-gray-600">
                Loading your bookmarks...
              </p>
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
                      bookmark.document.datePublished,
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
                      prev.filter((b) => b.documentId !== bookmark.documentId),
                    );
                    toast.success("Bookmark removed successfully");
                  }}
                  onError={(message) => toast.error(message)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
              <p className="text-lg font-medium text-gray-600">
                {searchQuery
                  ? "No bookmarks match your search."
                  : bookmarkedPapers.length === 0
                    ? "Your library is empty. Start bookmarking papers to save them here!"
                    : "No bookmarks found."}
              </p>
              {!searchQuery && bookmarkedPapers.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  Visit any paper page and click &quot;Add to Library&quot; to
                  get started.
                </p>
              )}
            </div>
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
