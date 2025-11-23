"use client";

import { Download, Library, Quote, Share2, Share } from "lucide-react";
import React from "react";
import { useLibrary } from "@/lib/hooks/useLibrary";

// Reusable internal button component
const ActionButton = ({
  icon: Icon,
  label,
  primary = false,
  onClick,
  isActive = false,
}: {
  icon: React.ElementType;
  label: string;
  primary?: boolean;
  onClick?: () => void;
  isActive?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors
      ${
        primary
          ? "border-transparent bg-red-700 text-white shadow-sm hover:bg-red-800"
          : isActive
          ? "border-yellow-400 bg-yellow-50 text-yellow-800"
          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
      }
      focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
    `}
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
  </button>
);

type ActionButtonsProps = {
  paperId: number;
};

export function ActionButtons({ paperId }: ActionButtonsProps) {
  const { isBookmarked, toggleBookmark, addToLibrary, bookmarkCount, maxBookmarks } = useLibrary();
  const isInLibrary = isBookmarked(paperId);

  const handleLibraryClick = async () => {
    if (isInLibrary) {
      await toggleBookmark(paperId);
    } else {
      const result = await addToLibrary(paperId);
      if (!result.success && result.message === "Free tier limit reached") {
        // Could show a toast notification here
        alert(`You've reached the free tier limit of ${maxBookmarks} bookmarks. Upgrade to Premium for unlimited bookmarks!`);
      }
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ActionButton icon={Download} label="Download PDF" primary />
        <ActionButton
          icon={Library}
          label={isInLibrary ? "Remove from Library" : "Add to Library"}
          onClick={handleLibraryClick}
          isActive={isInLibrary}
        />
        <ActionButton icon={Quote} label="Generate Citation" />
        <ActionButton icon={Share2} label="Share" />
      </div>
      {/* Standalone Share icon from image */}
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Share"
        >
          <Share className="h-5 w-5" />
        </button>
      </div>
    </>
  );
}
