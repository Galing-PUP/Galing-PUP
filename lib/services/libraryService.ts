/**
 * Library Service - API-based bookmark management
 *
 * Connects to the backend API for bookmark operations.
 * Authentication is now handled server-side via Supabase.
 */

export interface BookmarkDocument {
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
}

export interface BookmarkData {
  documentId: number;
  dateBookmarked: string;
  document: BookmarkDocument;
}

interface BookmarkResponse {
  success: boolean;
  message?: string;
  bookmarks?: BookmarkData[];
  count?: number;
  maxBookmarks?: number;
  currentCount?: number;
}

interface BookmarkStatusResponse {
  success: boolean;
  isBookmarked: boolean;
  dateBookmarked?: Date | null;
}

/**
 * Get all bookmarks for the current user
 */
export async function getBookmarks(): Promise<number[]> {
  try {
    const response = await fetch(`/api/bookmarks`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Don't cache bookmark data
    });

    if (!response.ok) {
      // Silently return empty array for 401 (not authenticated)
      if (response.status === 401) {
        return [];
      }
      console.error("Failed to fetch bookmarks:", response.statusText);
      return [];
    }

    const data: BookmarkResponse = await response.json();

    if (data.success && data.bookmarks) {
      return data.bookmarks.map((bookmark) => bookmark.documentId);
    }

    return [];
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return [];
  }
}

/**
 * Add a bookmark for the current user
 */
export async function addBookmark(
  documentId: number,
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`/api/bookmarks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ documentId }),
    });

    const data: BookmarkResponse = await response.json();

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 409) {
        return { success: false, message: "Already bookmarked" };
      }
      if (response.status === 403) {
        return {
          success: false,
          message: data.message || "Bookmark limit reached",
        };
      }
      if (response.status === 404) {
        return { success: false, message: "Document not found" };
      }
      return {
        success: false,
        message: data.message || "Failed to add bookmark",
      };
    }

    return {
      success: true,
      message: data.message || "Added to library",
    };
  } catch (error) {
    console.error("Error adding bookmark:", error);
    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
}

/**
 * Remove a bookmark for the current user
 */
export async function removeBookmark(
  documentId: number,
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(
      `/api/bookmarks/${documentId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const data: BookmarkResponse = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, message: "Bookmark not found" };
      }
      return {
        success: false,
        message: data.message || "Failed to remove bookmark",
      };
    }

    return {
      success: true,
      message: data.message || "Removed from library",
    };
  } catch (error) {
    console.error("Error removing bookmark:", error);
    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
}

/**
 * Check if a document is bookmarked
 */
export async function checkBookmarkStatus(
  documentId: number,
): Promise<boolean> {
  try {
    const response = await fetch(
      `/api/bookmarks/${documentId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return false;
    }

    const data: BookmarkStatusResponse = await response.json();
    return data.isBookmarked;
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    return false;
  }
}

/**
 * Get detailed bookmark data (for library page)
 */
export async function getDetailedBookmarks(): Promise<BookmarkData[]> {
  try {
    const response = await fetch(`/api/bookmarks`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      // Silently return empty array for 401 (not authenticated)
      if (response.status === 401) {
        return [];
      }
      console.error("Failed to fetch detailed bookmarks:", response.statusText);
      return [];
    }

    const data: BookmarkResponse = await response.json();

    if (data.success && data.bookmarks) {
      return data.bookmarks;
    }

    return [];
  } catch (error) {
    console.error("Error fetching detailed bookmarks:", error);
    return [];
  }
}
