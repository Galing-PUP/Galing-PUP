'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { ContentItem } from '@/types/content'

interface DeleteConfirmationDialogProps {
  item?: ContentItem | null
  isOpen: boolean
  onClose: () => void
  onConfirm: ((id: string) => void) | (() => void)
  itemCount?: number
  itemType?: 'document' | 'user'
}

/**
 * Reusable delete confirmation dialog
 * Supports both single item and bulk deletion
 */
export function DeleteConfirmationDialog({
  item,
  isOpen,
  onClose,
  onConfirm,
  itemCount,
  itemType = 'document',
}: DeleteConfirmationDialogProps) {
  const isBulkDelete = itemCount !== undefined && itemCount > 0
  
  if (!isBulkDelete && !item) {
    return null
  }

  const handleConfirm = () => {
    if (isBulkDelete) {
      ;(onConfirm as () => void)()
    } else if (item) {
      ;(onConfirm as (id: string) => void)(item.id)
    }
  }

  const itemLabel = itemType === 'user' ? 'user' : 'publication'
  const itemLabelPlural = itemType === 'user' ? 'users' : 'publications'

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {isBulkDelete
              ? `The selected ${itemLabelPlural} will be permanently deleted from the ${itemType === 'user' ? 'system' : 'database'}. This action cannot be undone.`
              : `The chosen ${itemLabel} will be permanently deleted from the ${itemType === 'user' ? 'system' : 'database'}. This action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isBulkDelete ? (
          <div className="my-4 rounded-md bg-red-50 border border-red-200 p-4 text-sm">
            <p className="font-semibold text-red-800">
              {itemCount} {itemCount === 1 ? itemLabel : itemLabelPlural} will
              be deleted
            </p>
          </div>
        ) : item ? (
          <div className="my-4 rounded-md bg-gray-100 p-3 text-sm">
            <span className="font-medium text-gray-500">
              {itemType === 'user' ? 'User:' : 'Publication Title:'}
            </span>
            <p className="font-semibold text-gray-800">
              {itemType === 'user' ? (item as any).name || (item as any).email : item.title}
            </p>
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-pup-maroon text-white hover:bg-pup-maroon/90 focus:ring-pup-maroon"
          >
            Delete {isBulkDelete && itemCount && itemCount > 1 ? itemLabelPlural : itemLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
