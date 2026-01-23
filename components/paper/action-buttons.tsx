'use client'

import { CitationModal } from '@/components/paper/citation-modal'
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
import { useLibrary } from '@/lib/hooks/useLibrary'
import { Download, Library, Quote, Share2 } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

// Reusable internal button component
const ActionButton = ({
  icon: Icon,
  label,
  primary = false,
  onClick,
  isActive = false,
}: {
  icon: React.ElementType
  label: string
  primary?: boolean
  onClick?: () => void
  isActive?: boolean
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors
      ${primary
        ? 'border-transparent bg-pup-maroon text-white shadow-sm hover:bg-pup-maroon/80'
        : isActive
          ? 'bg-pup-gold-light/30 border-pup-gold-dark text-pup-maroon'
          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
      }
      focus:outline-none focus:ring-2 focus:ring-pup-maroon focus:ring-offset-2
    `}
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
  </button>
)

type ActionButtonsProps = {
  paperId: number
  downloadToken: string
  pdfUrl?: string | null
  title?: string
  citation?: string
}

export function ActionButtons({
  paperId,
  downloadToken,
  pdfUrl,
  title,
  citation,
}: ActionButtonsProps) {
  const {
    isBookmarked,
    addToLibrary,
    removeFromLibrary,
    maxBookmarks,
    isAuthenticated,
  } = useLibrary()
  const isInLibrary = isBookmarked(paperId)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [isCitationModalOpen, setIsCitationModalOpen] = useState(false)

  const handleLibraryClick = async () => {
    if (isInLibrary) {
      // Show confirmation dialog before removing
      setShowRemoveDialog(true)
    } else {
      // Add to library
      const result = await addToLibrary(paperId)
      if (result.success) {
        toast.success('Added to library successfully')
      } else {
        if (result.message.includes('limit')) {
          toast.error(
            `You've reached the limit of ${maxBookmarks} bookmarks. Upgrade to Premium for higher limits!`,
          )
        } else {
          toast.error(result.message)
        }
      }
    }
  }

  const handleConfirmRemove = async () => {
    setIsRemoving(true)
    const result = await removeFromLibrary(paperId)
    setIsRemoving(false)

    if (result.success) {
      setShowRemoveDialog(false)
      toast.success('Removed from library successfully')
    } else {
      toast.error(result.message)
      setShowRemoveDialog(false)
    }
  }

  const handleDownloadClick = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to download documents')
      return
    }

    const toastId = toast.loading('Preparing download...')

    try {
      const res = await fetch(`/api/pdf/${encodeURIComponent(downloadToken)}`)

      if (!res.ok) {
        if (res.status === 403) {
          // Check if it's tier related or just general forbidden
          const text = await res.text()
          throw new Error(
            text || 'Access denied. Please check your subscription.',
          )
        }
        if (res.status === 404) throw new Error('Document not found.')
        throw new Error('Download failed.')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      // Try to get filename from header
      const contentDisposition = res.headers.get('Content-Disposition')
      let filename = title ? `${title}.pdf` : `document-${paperId}.pdf`

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/)
        if (match && match[1]) {
          filename = match[1]
        }
      }

      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.dismiss(toastId)
      toast.success('Download started')
    } catch (error) {
      toast.dismiss(toastId)
      toast.error(
        error instanceof Error
          ? error.message
          : 'An error occurred while downloading',
      )
    }
  }

  const handleShareClick = async () => {
    const url = window.location.href
    const shareTitle = title ?? 'Check out this paper from Galing-PUP'

    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url })
        return
      } catch {
        // User cancelled or share failed, fall through to clipboard fallback
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard.')
    } catch {
      toast.error(
        'Unable to share automatically. Please copy the URL from the address bar.',
      )
    }
  }

  const handleGenerateCitationClick = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error('Please sign in to generate citations')
      return
    }
    setIsCitationModalOpen(true)
  }

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
                e.preventDefault()
                handleConfirmRemove()
              }}
              disabled={isRemoving}
              className="bg-pup-maroon hover:bg-pup-maroon/80 focus:ring-pup-maroon"
            >
              {isRemoving ? 'Removing...' : 'Remove'}
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
          label={isInLibrary ? 'Remove from Library' : 'Add to Library'}
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

      {/* Citation Modal */}
      <CitationModal
        documentId={paperId}
        isOpen={isCitationModalOpen}
        onClose={() => setIsCitationModalOpen(false)}
      />
    </>
  )
}
