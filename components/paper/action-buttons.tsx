"use client";

import { Download, Library, Quote, Share2, Share } from "lucide-react";
import React, { useState } from "react";
import { useLibrary } from "@/lib/hooks/useLibrary";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const {
    isBookmarked,
    toggleBookmark,
    addToLibrary,
    removeFromLibrary,
    bookmarkCount,
    maxBookmarks,
  } = useLibrary();
  const isInLibrary = isBookmarked(paperId);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleLibraryClick = async () => {
    if (isInLibrary) {
      // Show confirmation dialog before removing
      setShowRemoveDialog(true);
    } else {
      // Add to library
      const result = await addToLibrary(paperId);
      if (result.success) {
        toast.success("Added to library successfully");
      } else {
        if (result.message.includes("limit")) {
          toast.error(
            `You've reached the limit of ${maxBookmarks} bookmarks. Upgrade to Premium for unlimited bookmarks!`,
          );
        } else {
          toast.error(result.message);
        }
      }
    }
  };

  const handleConfirmRemove = async () => {
    setIsRemoving(true);
    const result = await removeFromLibrary(paperId);
    setIsRemoving(false);

    if (result.success) {
      setShowRemoveDialog(false);
      toast.success("Removed from library successfully");
    } else {
      toast.error(result.message);
      setShowRemoveDialog(false);
    }
  };

  return (
    <>
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Library</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this document from your library?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmRemove();
              }}
              disabled={isRemoving}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isRemoving ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
