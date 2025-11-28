/**
 * Library Service - Abstracts data persistence layer
 * 
 * Currently uses localStorage, but can easily be swapped to API calls
 * by changing the implementation functions below.
 */

const LIBRARY_STORAGE_KEY = "galing-pup-library";

// ============================================
// CURRENT IMPLEMENTATION: localStorage
// ============================================

export async function getBookmarks(): Promise<number[]> {
  // TODO: Replace with API call when backend is ready
  // Example: const response = await fetch('/api/library');
  // return response.json();
  
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem(LIBRARY_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing library data:", e);
      return [];
    }
  }
  return [];
}

export async function addBookmark(paperId: number): Promise<{ success: boolean; message: string }> {
  // TODO: Replace with API call when backend is ready
  // Example: 
  // const response = await fetch('/api/library', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ paperId })
  // });
  // return response.json();
  
  if (typeof window === "undefined") {
    return { success: false, message: "Not available on server" };
  }
  
  const current = await getBookmarks();
  if (current.includes(paperId)) {
    return { success: false, message: "Already in library" };
  }
  
  const updated = [...current, paperId];
  localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(updated));
  return { success: true, message: "Added to library" };
}

export async function removeBookmark(paperId: number): Promise<{ success: boolean; message: string }> {
  // TODO: Replace with API call when backend is ready
  // Example:
  // const response = await fetch(`/api/library/${paperId}`, {
  //   method: 'DELETE'
  // });
  // return response.json();
  
  if (typeof window === "undefined") {
    return { success: false, message: "Not available on server" };
  }
  
  const current = await getBookmarks();
  const updated = current.filter((id) => id !== paperId);
  localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(updated));
  return { success: true, message: "Removed from library" };
}

export async function checkBookmarkStatus(paperId: number): Promise<boolean> {
  // TODO: Replace with API call when backend is ready
  // Example: const response = await fetch(`/api/library/${paperId}/status`);
  // const data = await response.json();
  // return data.isBookmarked;
  
  const bookmarks = await getBookmarks();
  return bookmarks.includes(paperId);
}

// ============================================
// FUTURE IMPLEMENTATION: API Calls
// ============================================
// 
// When you have a backend, simply replace the functions above with:
//
// export async function getBookmarks(): Promise<number[]> {
//   const response = await fetch('/api/user/library', {
//     credentials: 'include' // for auth cookies
//   });
//   if (!response.ok) throw new Error('Failed to fetch bookmarks');
//   const data = await response.json();
//   return data.bookmarkIds;
// }
//
// export async function addBookmark(paperId: number): Promise<{ success: boolean; message: string }> {
//   const response = await fetch('/api/user/library', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     credentials: 'include',
//     body: JSON.stringify({ paperId })
//   });
//   if (!response.ok) {
//     const error = await response.json();
//     return { success: false, message: error.message || 'Failed to add bookmark' };
//   }
//   return { success: true, message: "Added to library" };
// }
//
// export async function removeBookmark(paperId: number): Promise<{ success: boolean; message: string }> {
//   const response = await fetch(`/api/user/library/${paperId}`, {
//     method: 'DELETE',
//     credentials: 'include'
//   });
//   if (!response.ok) {
//     const error = await response.json();
//     return { success: false, message: error.message || 'Failed to remove bookmark' };
//   }
//   return { success: true, message: "Removed from library" };
// }
//
// export async function checkBookmarkStatus(paperId: number): Promise<boolean> {
//   const response = await fetch(`/api/user/library/${paperId}/status`, {
//     credentials: 'include'
//   });
//   if (!response.ok) return false;
//   const data = await response.json();
//   return data.isBookmarked;
// }

