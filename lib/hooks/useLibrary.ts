"use client";

import { useState, useEffect, useCallback } from "react";
import * as libraryService from "@/lib/services/libraryService";
import { createClient } from "@/lib/supabase/client";

interface UserTier {
  maxBookmarks: number | null;
  tierName: string;
}

export function useLibrary() {
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [maxBookmarks, setMaxBookmarks] = useState<number | null>(10);
  const [tierName, setTierName] = useState("Free");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load bookmarks and user tier on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        // Check if user is authenticated
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // User not authenticated, skip API calls
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        setIsAuthenticated(true);

        // Fetch bookmarks
        const bookmarks = await libraryService.getBookmarks();
        setBookmarkedIds(bookmarks);

        // Fetch user tier info
        const tierResponse = await fetch(`/api/user/tier`);
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
      if (!isAuthenticated) {
        return { 
          success: false, 
          message: "Please sign in to bookmark documents" 
        };
      }

      if (isBookmarked(id)) {
        return { success: false, message: "Already in library" };
      }

      // Check if limit is reached (null means unlimited)
      if (maxBookmarks !== null && bookmarkedIds.length >= maxBookmarks) {
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
    [bookmarkedIds, maxBookmarks, tierName, isBookmarked, isAuthenticated],
  );

  const removeFromLibrary = useCallback(async (id: number) => {
    if (!isAuthenticated) {
      return { 
        success: false, 
        message: "Please sign in to manage bookmarks" 
      };
    }

    const result = await libraryService.removeBookmark(id);
    if (result.success) {
      setBookmarkedIds((prev) =>
        prev.filter((bookmarkId) => bookmarkId !== id),
      );
    }
    return result;
  }, [isAuthenticated]);

  return {
    bookmarkedIds,
    isBookmarked,
    addToLibrary,
    removeFromLibrary,
    bookmarkCount: bookmarkedIds.length,
    maxBookmarks,
    tierName,
    isLoading,
    isAuthenticated,
  };
}
