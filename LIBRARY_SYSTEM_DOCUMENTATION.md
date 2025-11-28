# Library System Documentation

## Overview
This document lists all files, components, and changes added to implement the "My Library" feature that allows users to bookmark/favorite research papers.

---

## 📁 Files Created

### 1. **Library Management Hook**
**Path:** `lib/hooks/useLibrary.ts`

**Purpose:** React hook that manages bookmark state and provides functions to add/remove bookmarks.

**Key Features:**
- Manages bookmark state using React hooks
- Integrates with `libraryService` for data persistence
- Provides bookmark count and limit tracking
- Returns loading state for async operations
- Functions:
  - `isBookmarked(id)` - Check if paper is bookmarked
  - `addToLibrary(id)` - Add paper to library (async)
  - `removeFromLibrary(id)` - Remove paper from library (async)
  - `toggleBookmark(id)` - Toggle bookmark status (async)
  - `bookmarkCount` - Current number of bookmarks
  - `maxBookmarks` - Maximum allowed (5 for free tier)
  - `isLoading` - Loading state indicator

**Dependencies:**
- `lib/services/libraryService.ts`

---

### 2. **Library Service Layer**
**Path:** `lib/services/libraryService.ts`

**Purpose:** Abstraction layer for data persistence. Currently uses localStorage but designed for easy migration to backend API.

**Key Features:**
- Abstracts all data operations from components
- Currently implements localStorage-based storage
- Includes commented examples for future API integration
- Functions:
  - `getBookmarks()` - Fetch all bookmarked paper IDs
  - `addBookmark(paperId)` - Add a bookmark
  - `removeBookmark(paperId)` - Remove a bookmark
  - `checkBookmarkStatus(paperId)` - Check if paper is bookmarked

**Migration Notes:**
- When backend is ready, simply replace function implementations with API calls
- No changes needed in components or hooks
- Example API endpoints documented in comments:
  - `GET /api/user/library` - Get bookmarks
  - `POST /api/user/library` - Add bookmark
  - `DELETE /api/user/library/:paperId` - Remove bookmark
  - `GET /api/user/library/:paperId/status` - Check status

---

### 3. **Library Page**
**Path:** `app/library/page.tsx`

**Purpose:** Main page displaying user's bookmarked papers.

**Key Features:**
- Header section with maroon background showing:
  - "My Library" title
  - Bookmark count (X / 5)
- Search functionality to filter bookmarked papers
- Filter button (UI ready for future implementation)
- Displays bookmarked papers from `mockResults.ts`
- Premium banner when free tier limit is reached
- Premium upgrade section at bottom
- Empty state message when no bookmarks exist

**Components Used:**
- `Header` - Site navigation
- `BookmarkCard` - Individual paper card
- `PremiumBanner` - Limit reached notification
- `PremiumSection` - Upgrade promotion

**Data Source:**
- Filters `mockResults.ts` based on bookmarked IDs
- Uses `useLibrary` hook for state management

---

### 4. **Bookmark Card Component**
**Path:** `components/library/bookmark-card.tsx`

**Purpose:** Displays a single bookmarked paper with actions.

**Key Features:**
- Yellow border card design matching design spec
- Shows document type tag (Thesis/Research Paper)
- Year tag
- Paper title (clickable link to paper page)
- Author names and affiliation
- Download count
- Action buttons:
  - **Remove** - Red outline button with trash icon
  - **View Details** - White outline button with eye icon
  - **Download** - Maroon button with download icon

**Props:**
- `result: SearchResult` - Paper data object

**Functions:**
- `handleRemove()` - Removes paper from library

---

### 5. **Premium Banner Component**
**Path:** `components/library/premium-banner.tsx`

**Purpose:** Yellow banner shown when user reaches free tier bookmark limit.

**Key Features:**
- Yellow background with alert icon
- Shows current usage (e.g., "You're using 5 of 5 bookmarks")
- "Upgrade to Premium" button with crown icon
- Links to `/pricing` page
- Only displays when limit is reached

**Props:**
- `usedBookmarks: number` - Current bookmark count
- `maxBookmarks: number` - Maximum allowed bookmarks

---

### 6. **Premium Section Component**
**Path:** `components/library/premium-section.tsx`

**Purpose:** Large promotional section encouraging premium upgrade.

**Key Features:**
- Maroon background section
- Crown icon and "Unlock Unlimited Bookmarks" heading
- List of premium benefits:
  - Unlimited bookmarks and downloads
  - No advertisements
  - Full access to AI-generated insights
- Yellow "Upgrade Now" button
- Links to `/pricing` page

---

## 🔄 Files Modified

### 7. **Action Buttons Component (Updated)**
**Path:** `components/paper/action-buttons.tsx`

**Changes Made:**
- Converted to client component (`"use client"`)
- Added `paperId` prop to receive paper ID
- Integrated `useLibrary` hook
- "Add to Library" button now:
  - Shows active state (yellow background) when bookmarked
  - Changes label to "Remove from Library" when active
  - Handles async add/remove operations
  - Shows alert when free tier limit is reached

**New Props:**
- `paperId: number` - ID of the paper

**New Features:**
- Visual feedback for bookmarked state
- Error handling for limit reached
- Async bookmark operations

---

### 8. **Paper Page (Updated)**
**Path:** `app/paper/[id]/page.tsx`

**Changes Made:**
- Passes `paperId` prop to `ActionButtons` component
- Extracts ID from route params and converts to number
- Fixed minor JSX typo (removed stray "1")

**Key Change:**
```tsx
<ActionButtons paperId={parseInt(id)} />
```

---

### 9. **Layout Metadata (Updated) - From Earlier**
**Path:** `app/layout.tsx`

**Changes Made:**
- Added icon metadata to point to new favicon
- Updated favicon from `favicon.ico` to `icon.png` (star logo)

**Note:** This was done earlier in the conversation for favicon change.

---

## 📊 Data Flow

```
User clicks "Add to Library"
    ↓
ActionButtons component
    ↓
useLibrary hook (addToLibrary)
    ↓
libraryService (addBookmark)
    ↓
localStorage (or future: API call)
    ↓
State updates
    ↓
UI reflects change
```

---

## 🎨 Design Specifications

### Color Scheme
- **Maroon:** `#6b0504` - Primary brand color
- **Yellow:** `#fbbf24` (yellow-400) - Accent color for bookmarks
- **White:** Background for cards
- **Gray:** Text and borders

### Free Tier Limits
- **Maximum Bookmarks:** 5 papers
- **Storage:** localStorage (temporary, will migrate to backend)

---

## 🔌 Integration Points

### With Existing System
- Uses `mockResults.ts` for paper data
- Integrates with existing `Header` component
- Follows existing design patterns and component structure
- Uses same routing structure (`/library` route)

### Future Backend Integration
- Service layer ready for API calls
- No component changes needed
- Just update `libraryService.ts` functions

---

## 📝 Storage Details

### localStorage Key
- **Key:** `"galing-pup-library"`
- **Format:** JSON array of paper IDs: `[1, 2, 3, ...]`
- **Example:** `"[1, 5, 12]"`

---

## 🧪 Testing Considerations

### What to Test
1. Adding papers to library
2. Removing papers from library
3. Free tier limit enforcement (5 bookmarks max)
4. Search functionality on library page
5. Empty state when no bookmarks
6. Premium banner display at limit
7. Persistence across page refreshes
8. Multiple browser tabs synchronization (localStorage)

---

## 🚀 Future Enhancements

### Potential Additions
- [ ] Backend API integration
- [ ] User authentication integration
- [ ] Sync across devices
- [ ] Bookmark folders/categories
- [ ] Export bookmarks feature
- [ ] Share library feature
- [ ] Bookmark notes/tags
- [ ] Filter by field/date on library page
- [ ] Sort options (newest, oldest, title)

---

## 📦 Dependencies

### New Dependencies
- None (uses existing React, Next.js, and Tailwind CSS)

### Internal Dependencies
- `@/data/mockResults` - Paper data source
- `@/components/header` - Navigation
- `lucide-react` - Icons (already in project)

---

## 🗂️ File Structure Summary

```
Galing-PUP/
├── app/
│   ├── library/
│   │   └── page.tsx                    [NEW]
│   └── paper/[id]/
│       └── page.tsx                    [MODIFIED]
├── components/
│   ├── library/
│   │   ├── bookmark-card.tsx          [NEW]
│   │   ├── premium-banner.tsx          [NEW]
│   │   └── premium-section.tsx         [NEW]
│   └── paper/
│       └── action-buttons.tsx          [MODIFIED]
├── lib/
│   ├── hooks/
│   │   └── useLibrary.ts               [NEW]
│   └── services/
│       └── libraryService.ts           [NEW]
└── data/
    └── mockResults.ts                  [EXISTING - used by library]
```

---

## ✅ Checklist for Documentation

- [x] All new files listed
- [x] All modified files listed
- [x] Purpose of each component explained
- [x] Key features documented
- [x] Data flow explained
- [x] Integration points identified
- [x] Future migration path documented
- [x] File structure provided

---

**Last Updated:** [Current Date]
**Version:** 1.0.0
**Status:** Production Ready (localStorage) / Backend Ready (API integration pending)

