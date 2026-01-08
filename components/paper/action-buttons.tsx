"use client";

import { Download, Library, Quote, Share2 } from "lucide-react";
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
          ? "border-transparent bg-pup-maroon text-white shadow-sm hover:bg-pup-maroon/80"
          : isActive
            ? "bg-pup-gold-light/30 border-pup-gold-dark text-pup-maroon"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
      }
      focus:outline-none focus:ring-2 focus:ring-pup-maroon focus:ring-offset-2
    `}
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
  </button>
);

type ActionButtonsProps = {
  paperId: number;
  pdfUrl?: string | null;
  title?: string;
  citation?: string;
};

export function ActionButtons({
  paperId,
  pdfUrl,
  title,
  citation,
}: ActionButtonsProps) {
  const { isBookmarked, addToLibrary, removeFromLibrary, maxBookmarks } =
    useLibrary();
  const isInLibrary = isBookmarked(paperId);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isCitationModalOpen, setIsCitationModalOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<"APA" | "MLA" | "Chicago">(
    "APA",
  );
  const [citationCount, setCitationCount] = useState(0);
  const [isCopiedModalOpen, setIsCopiedModalOpen] = useState(false);
  const CITATION_LIMIT = 5;

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
            `You've reached the limit of ${maxBookmarks} bookmarks. Upgrade to Premium for higher limits!`,
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

  const handleDownloadClick = () => {
    if (!pdfUrl) {
      alert("PDF is not available for this document.");
      return;
    }

    try {
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    } catch {
      // Fallback: just change location if window.open is blocked
      window.location.href = pdfUrl;
    }
  };

  const handleShareClick = async () => {
    const url = window.location.href;
    const shareTitle = title ?? "Check out this paper from Galing-PUP";

    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url });
        return;
      } catch {
        // User cancelled or share failed, fall through to clipboard fallback
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard.");
    } catch {
      alert(
        "Unable to share automatically. Please copy the URL from the address bar.",
      );
    }
  };

  const handleGenerateCitationClick = () => {
    if (!citation) {
      alert("Citation details are not available for this document.");
      return;
    }

    if (citationCount >= CITATION_LIMIT) {
      alert(
        `You've reached the free limit of ${CITATION_LIMIT} citation generations for this session.`,
      );
      return;
    }

    setIsCitationModalOpen(true);
  };

  const buildStyledCitation = () => {
    if (!citation) return "";

    switch (selectedStyle) {
      case "MLA":
        // Simple MLA-like variation
        return `${citation} (MLA style approximation)`;
      case "Chicago":
        // Simple Chicago-like variation
        return `${citation} (Chicago style approximation)`;
      case "APA":
      default:
        return `${citation} (APA style approximation)`;
    }
  };

  const handleCopyStyledCitation = async () => {
    const styledCitation = buildStyledCitation();
    if (!styledCitation) return;

    try {
      await navigator.clipboard.writeText(styledCitation);
      setCitationCount((prev) => prev + 1);
      setIsCopiedModalOpen(true);
    } catch {
      alert(styledCitation);
    }

    setIsCitationModalOpen(false);
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
              className="bg-pup-maroon hover:bg-pup-maroon/80 focus:ring-pup-maroon"
            >
              {isRemoving ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ActionButton
          icon={Download}
          label="Download PDF"
          primary
          onClick={handleDownloadClick}
        />
        <ActionButton
          icon={Library}
          label={isInLibrary ? "Remove from Library" : "Add to Library"}
          onClick={handleLibraryClick}
          isActive={isInLibrary}
        />
        <ActionButton
          icon={Quote}
          label="Generate Citation"
          onClick={handleGenerateCitationClick}
        />
        <ActionButton icon={Share2} label="Share" onClick={handleShareClick} />
      </div>

      {isCitationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900">
              Choose citation style
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Select a style and copy the generated citation. You have used{" "}
              <span className="font-semibold">{citationCount}</span> of{" "}
              <span className="font-semibold">{CITATION_LIMIT}</span> free
              citations this session.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {(["APA", "MLA", "Chicago"] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setSelectedStyle(style)}
                  className={`rounded-full px-4 py-1 text-sm font-medium border ${
                    selectedStyle === style
                      ? "bg-pup-maroon text-white border-pup-maroon"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preview
              </label>
              <div className="max-h-32 overflow-y-auto rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
                {buildStyledCitation()}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIsCitationModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-md bg-pup-maroon px-4 py-2 text-sm font-medium text-white hover:bg-pup-maroon/80"
                onClick={handleCopyStyledCitation}
              >
                Copy citation
              </button>
            </div>
          </div>
        </div>
      )}

      {isCopiedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Citation copied
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              The citation has been copied to your clipboard. You can now paste
              it into your document.
            </p>
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                className="rounded-md bg-pup-maroon px-4 py-2 text-sm font-medium text-white hover:bg-pup-maroon/80"
                onClick={() => setIsCopiedModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
