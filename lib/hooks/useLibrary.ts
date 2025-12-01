"use client";

import { useState, useEffect, useCallback } from "react";
import * as libraryService from "@/lib/services/libraryService";

// TODO: Remove this hardcoded value once auth is implemented
const TEMP_USER_ID = 1;

interface UserTier {
  maxBookmarks: number;
  tierName: string;
}

export function useLibrary() {
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [maxBookmarks, setMaxBookmarks] = useState(10);
  const [tierName, setTierName] = useState("Free");

  // Load bookmarks and user tier on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        // Fetch bookmarks
        const bookmarks = await libraryService.getBookmarks();
        setBookmarkedIds(bookmarks);

        // Fetch user tier info
        // TODO: Remove userId param once auth is implemented
        const tierResponse = await fetch(
          `/api/user/tier?userId=${TEMP_USER_ID}`,
        );
        if (tierResponse.ok) {
          const tierData: UserTier = await tierResponse.json();
          setMaxBookmarks(tierData.maxBookmarks);
          setTierName(tierData.tierName);
        }
      } catch (error) {
        console.error("Error loading library data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const isBookmarked = useCallback(
    (id: number) => bookmarkedIds.includes(id),
    [bookmarkedIds],
  );

  const addToLibrary = useCallback(
    async (id: number) => {
      if (isBookmarked(id)) {
        return { success: false, message: "Already in library" };
      }

      if (bookmarkedIds.length >= maxBookmarks) {
        return {
          success: false,
          message: `${tierName} tier limit reached (${maxBookmarks} bookmarks)`,
        };
      }

      const result = await libraryService.addBookmark(id);
      if (result.success) {
        setBookmarkedIds((prev) => [...prev, id]);
      }
      return result;
    },
    [bookmarkedIds, maxBookmarks, tierName, isBookmarked],
  );

  const removeFromLibrary = useCallback(async (id: number) => {
    const result = await libraryService.removeBookmark(id);
    if (result.success) {
      setBookmarkedIds((prev) =>
        prev.filter((bookmarkId) => bookmarkId !== id),
      );
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
    [isBookmarked, addToLibrary, removeFromLibrary],
  );

  return {
    bookmarkedIds,
    isBookmarked,
    addToLibrary,
    removeFromLibrary,
    toggleBookmark,
    bookmarkCount: bookmarkedIds.length,
    maxBookmarks,
    tierName,
    isLoading,
  };
}
