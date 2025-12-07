"use client";

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
import type { ContentItem } from "@/types/content";

interface DeleteConfirmationDialogProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export function DeleteConfirmationDialog({ item, isOpen, onClose, onConfirm }: DeleteConfirmationDialogProps) {
  if (!item) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm(item.id);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            The chosen publication will be permanently deleted from the database. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Display the publication title */}
        <div className="my-4 rounded-md bg-gray-100 p-3 text-sm">
          <span className="font-medium text-gray-500">Publication Title:</span>
          <p className="font-semibold text-gray-800">{item.title}</p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
          >
            Delete Publication
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
