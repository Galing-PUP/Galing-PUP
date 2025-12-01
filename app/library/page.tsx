"use client";

import { Header } from "@/components/header";
import { BookmarkCard } from "@/components/library/bookmark-card";
import { PremiumBanner } from "@/components/library/premium-banner";
import { PremiumSection } from "@/components/library/premium-section";
import { useLibrary } from "@/lib/hooks/useLibrary";
import { useState, useMemo, useEffect } from "react";
import { Filter, Search } from "lucide-react";
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
  const { bookmarkCount, maxBookmarks, isLoading: hookLoading } = useLibrary();
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkedPapers, setBookmarkedPapers] = useState<BookmarkedPaper[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  // Fetch bookmarked papers from API on mount only
  useEffect(() => {
    async function fetchBookmarks() {
      setIsLoading(true);
      try {
        const bookmarks = await libraryService.getDetailedBookmarks();
        setBookmarkedPapers(bookmarks);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBookmarks();
  }, []);

  // Filter by search query
  const filteredPapers = useMemo(() => {
    if (!searchQuery.trim()) return bookmarkedPapers;

    const query = searchQuery.toLowerCase();
    return bookmarkedPapers.filter(
      (paper) =>
        paper.document.title.toLowerCase().includes(query) ||
        paper.document.authors.some((author: string) =>
          author.toLowerCase().includes(query),
        ) ||
        paper.document.course.toLowerCase().includes(query) ||
        paper.document.abstract.toLowerCase().includes(query),
    );
  }, [bookmarkedPapers, searchQuery]);

  return (
    <>
      <Header />
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
                  {bookmarkCount} / {maxBookmarks}
                </div>
                <p className="text-sm text-gray-200">Bookmarks Used</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          {/* Premium Banner */}
          {bookmarkCount >= maxBookmarks && (
            <div className="mb-6">
              <PremiumBanner
                usedBookmarks={bookmarkCount}
                maxBookmarks={maxBookmarks}
              />
            </div>
          )}

          {/* Search and Filter Bar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search your bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-0"
              />
            </div>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>

          {/* Bookmarked Papers */}
          {isLoading || hookLoading ? (
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
                  : bookmarkCount === 0
                    ? "Your library is empty. Start bookmarking papers to save them here!"
                    : "No bookmarks found."}
              </p>
              {!searchQuery && bookmarkCount === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  Visit any paper page and click &quot;Add to Library&quot; to
                  get started.
                </p>
              )}
            </div>
          )}

          {/* Premium Section */}
          {bookmarkCount > 0 && (
            <div className="mt-12">
              <PremiumSection />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
