"use client";

import { useState, useEffect, useCallback } from "react";
import * as libraryService from "@/lib/services/libraryService";

const MAX_FREE_BOOKMARKS = 5;

export function useLibrary() {
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load bookmarks on mount
  useEffect(() => {
    async function loadBookmarks() {
      try {
        setIsLoading(true);
        const bookmarks = await libraryService.getBookmarks();
        setBookmarkedIds(bookmarks);
      } catch (error) {
        console.error("Error loading bookmarks:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadBookmarks();
  }, []);

  const isBookmarked = useCallback(
    (id: number) => bookmarkedIds.includes(id),
    [bookmarkedIds]
  );

  const addToLibrary = useCallback(
    async (id: number) => {
      if (!isBookmarked(id)) {
        if (bookmarkedIds.length >= MAX_FREE_BOOKMARKS) {
          return { success: false, message: "Free tier limit reached" };
        }
        
        const result = await libraryService.addBookmark(id);
        if (result.success) {
          setBookmarkedIds((prev) => [...prev, id]);
        }
        return result;
      }
      return { success: false, message: "Already in library" };
    },
    [bookmarkedIds.length, isBookmarked]
  );

  const removeFromLibrary = useCallback(async (id: number) => {
    const result = await libraryService.removeBookmark(id);
    if (result.success) {
      setBookmarkedIds((prev) => prev.filter((bookmarkId) => bookmarkId !== id));
    }
    return result;
  }, []);

  const toggleBookmark = useCallback(
    async (id: number) => {
      if (isBookmarked(id)) {
        return removeFromLibrary(id);
      } else {
        return addToLibrary(id);
      }
    },
    [isBookmarked, addToLibrary, removeFromLibrary]
  );

  return {
    bookmarkedIds,
    isBookmarked,
    addToLibrary,
    removeFromLibrary,
    toggleBookmark,
    bookmarkCount: bookmarkedIds.length,
    maxBookmarks: MAX_FREE_BOOKMARKS,
    isLoading,
  };
}

