"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, Eye, Download } from "lucide-react";
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

type SearchResult = {
  id: number;
  title: string;
  authors: string[];
  field: string;
  college?: string;
  year: number;
  abstract: string;
  citations?: number;
  downloads?: number;
  type?: string;
  dateBookmarked?: Date | string;
};

type BookmarkCardProps = {
  result: SearchResult;
  onRemove?: () => void;
  onError?: (message: string) => void;
  removeBookmark?: (id: number) => Promise<{ success: boolean; message: string }>;
};

export function BookmarkCard({ result, onRemove, onError, removeBookmark }: BookmarkCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmRemove = async () => {
    if (!removeBookmark) {
      if (onError) {
        onError("Remove function not provided");
      }
      return;
    }

    setIsRemoving(true);
    const response = await removeBookmark(result.id);
    setIsRemoving(false);

    if (response.success) {
      setShowConfirm(false);
      // Call the callback to refresh the list
      if (onRemove) {
        onRemove();
      }
    } else {
      // Show error via callback or fallback to alert
      if (onError) {
        onError(response.message);
      } else {
        alert(response.message);
      }
      setShowConfirm(false);
    }
  };

  // Determine document type
  const getDocumentType = () => {
    if (result.type) return result.type;
    if (result.title.toLowerCase().includes("thesis")) return "Thesis";
    if (result.title.toLowerCase().includes("dissertation"))
      return "Dissertation";
    return "Research Paper";
  };

  return (
    <>
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Bookmark</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &quot;{result.title}&quot; from
              your library? This action cannot be undone.
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

      <div className="rounded-lg border-2 border-yellow-400 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          {/* Left Content */}
          <div className="flex-1 space-y-3">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#6b0504] px-3 py-1 text-xs font-medium text-white">
                {getDocumentType()}
              </span>
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-gray-800">
                {result.year}
              </span>
            </div>

            {/* Title */}
            <Link href={`/paper/${result.id}`}>
              <h3 className="text-lg font-bold text-[#6b0504] hover:text-[#4a0403] transition-colors">
                {result.title}
              </h3>
            </Link>

            {/* Authors and Affiliation */}
            <div className="text-sm text-gray-600">
              <span>By </span>
              {result.authors.slice(0, 3).map((author, index) => (
                <span key={index}>
                  <span className="font-medium">{author}</span>
                  {index < Math.min(result.authors.length - 1, 2) && " • "}
                </span>
              ))}
              {result.authors.length > 3 && (
                <span> • +{result.authors.length - 3} more</span>
              )}
              <span> • {result.field}</span>
              {result.college && <span> • {result.college}</span>}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {result.downloads !== undefined && (
                <span>{result.downloads.toLocaleString()} downloads</span>
              )}
              {result.citations !== undefined && (
                <span>{result.citations.toLocaleString()} citations</span>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex flex-col gap-2 md:flex-shrink-0">
            <button
              onClick={handleRemoveClick}
              type="button"
              disabled={isRemoving}
              className="flex items-center justify-center gap-2 rounded-lg border border-red-500 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
              <span>{isRemoving ? "Removing..." : "Remove"}</span>
            </button>
            <Link
              href={`/paper/${result.id}`}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>View Details</span>
            </Link>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg border-transparent bg-[#6b0504] px-4 py-2 text-sm font-medium text-white hover:bg-[#4a0403] transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
