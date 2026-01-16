'use client'

import { ContentManagementHeader } from '@/components/admin/approval/content-management-header'
import { ContentTable } from '@/components/admin/approval/content-table'
import {
  ContentTabs,
  type TabStatus,
} from '@/components/admin/approval/content-tabs'
import { DeleteConfirmationDialog } from '@/components/admin/approval/delete-confirmation-dialog'
import { ViewPublicationModal } from '@/components/admin/approval/view-publication-modal'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import type { ContentItem } from '@/types/content'
import { Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

const ITEMS_PER_PAGE = 10

export default function ContentApprovalPage() {
  const [allContentItems, setAllContentItems] = useState<ContentItem[]>([])
  const [activeTab, setActiveTab] = useState<TabStatus>('Pending')
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [viewingDocumentId, setViewingDocumentId] = useState<string | null>(
    null,
  )
  const [viewingDocumentStatus, setViewingDocumentStatus] = useState<
    'Pending' | 'Accepted' | 'Rejected' | 'Deleted' | null
  >(null)
  const [itemToDelete, setItemToDelete] = useState<ContentItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([])
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)

  /**
   * Fetches all documents for approval from the API
   */
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/admin/approval')
        if (!res.ok) {
          throw new Error(`Failed to load documents: ${res.status}`)
        }
        const data: ContentItem[] = await res.json()
        setAllContentItems(data)
      } catch (e) {
        console.error('Error fetching documents:', e)
        setError('Failed to load documents from the database.')
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  /**
   * Handles accepting a document by updating its status to "Accepted"
   * @param itemId - The ID of the document to accept
   */
  const handleAccept = async (itemId: string) => {
    try {
      const res = await fetch(`/api/admin/documents/${itemId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Accepted' }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.error || 'Failed to accept document')
      }

      // Update local state
      setAllContentItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, status: 'Accepted' } : item,
        ),
      )
      setSelectedItem(null)
      setViewingDocumentId(null)
      toast.success('Document accepted successfully')
    } catch (error) {
      console.error('Error accepting document:', error)
      toast.error(
        'There was an error accepting this document. Please try again.',
      )
    }
  }

  /**
   * Handles rejecting a document by updating its status to "Rejected"
   * @param itemId - The ID of the document to reject
   */
  const handleReject = async (itemId: string) => {
    try {
      const res = await fetch(`/api/admin/documents/${itemId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Rejected' }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.error || 'Failed to reject document')
      }

      // Update local state
      setAllContentItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, status: 'Rejected' } : item,
        ),
      )
      setSelectedItem(null)
      setViewingDocumentId(null)
      toast.success('Document rejected successfully')
    } catch (error) {
      console.error('Error rejecting document:', error)
      toast.error(
        'There was an error rejecting this document. Please try again.',
      )
    }
  }

  /**
   * Handles restoring a rejected document by updating its status to "Pending"
   * @param itemId - The ID of the document to restore
   */
  const handleRestore = async (itemId: string) => {
    try {
      const res = await fetch(`/api/admin/documents/${itemId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Pending' }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.error || 'Failed to restore document')
      }

      // Update local state
      setAllContentItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, status: 'Pending' } : item,
        ),
      )
      setViewingDocumentStatus('Pending')
      toast.success('Document restored to pending successfully')
    } catch (error) {
      console.error('Error restoring document:', error)
      toast.error(
        'There was an error restoring this document. Please try again.',
      )
    }
  }

  /**
   * Handles permanently deleting a document (only for super admin in approval page)
   * @param itemId - The ID of the document to permanently delete
   */
  const handleDelete = async (itemId: string) => {
    try {
      const res = await fetch(`/api/admin/documents/${itemId}?permanent=true`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.error || 'Failed to delete document')
      }

      // Update local state
      setAllContentItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemId),
      )
      setItemToDelete(null)
      toast.success('Document permanently deleted successfully')
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error(
        'There was an error deleting this document. Please try again.',
      )
    }
  }

  /**
   * Opens the view modal for a document
   * @param item - The document item to view
   */
  const handleView = (item: ContentItem) => {
    setViewingDocumentId(item.id)
    setViewingDocumentStatus(item.status)
  }

  /**
   * Opens the delete confirmation dialog for a document
   * @param item - The document item to delete
   */
  const handleDeleteRequest = (item: ContentItem) => {
    setItemToDelete(item)
  }

  /**
   * Toggles selection of a content item
   * @param contentId - The ID of the content to select/deselect
   */
  const handleSelectContent = (contentId: string) => {
    setSelectedContentIds((prev) =>
      prev.includes(contentId)
        ? prev.filter((id) => id !== contentId)
        : [...prev, contentId],
    )
  }

  /**
   * Toggles selection of all visible content items
   */
  const handleSelectAll = () => {
    setSelectedContentIds(
      selectedContentIds.length === paginatedItems.length
        ? []
        : paginatedItems.map((item) => item.id),
    )
  }

  /**
   * Opens the bulk delete confirmation dialog
   */
  const handleDeleteSelected = () => {
    if (selectedContentIds.length === 0) return
    setShowBulkDeleteDialog(true)
  }

  /**
   * Handles the actual bulk deletion after confirmation
   */
  const confirmDeleteSelected = async () => {
    if (selectedContentIds.length === 0) return

    try {
      // Delete each selected document
      const deletePromises = selectedContentIds.map((id) =>
        fetch(`/api/admin/documents/${id}?permanent=true`, {
          method: 'DELETE',
        }),
      )

      const results = await Promise.all(deletePromises)

      // Check if all deletions were successful
      const failedDeletions = results.filter((res) => !res.ok)
      if (failedDeletions.length > 0) {
        throw new Error(
          `Failed to delete ${failedDeletions.length} document(s)`,
        )
      }

      // Update local state
      setAllContentItems((prevItems) =>
        prevItems.filter((item) => !selectedContentIds.includes(item.id)),
      )
      setSelectedContentIds([])
      toast.success(
        `${selectedContentIds.length} document(s) deleted successfully`,
      )
    } catch (error) {
      console.error('Error deleting documents:', error)
      toast.error(
        'There was an error deleting some documents. Please try again.',
      )
    }
  }

  /**
   * Filters items based on the active tab
   */
  const filteredItems = useMemo(() => {
    return allContentItems.filter((item) => item.status === activeTab)
  }, [allContentItems, activeTab])

  /**
   * Resets to page 1 and clears selection when tab changes
   */
  useEffect(() => {
    setCurrentPage(1)
    setSelectedContentIds([])
  }, [activeTab])

  /**
   * Calculates paginated items for the current page
   */
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredItems.slice(startIndex, endIndex)
  }, [filteredItems, currentPage])

  /**
   * Calculates total number of pages
   */
  const totalPages = useMemo(() => {
    return Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
  }, [filteredItems.length])

  /**
   * Generates page numbers for pagination display
   */
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }

    return pages
  }

  const counts = useMemo(
    () => ({
      pending: allContentItems.filter((item) => item.status === 'Pending')
        .length,
      rejected: allContentItems.filter((item) => item.status === 'Rejected')
        .length,
      deleted: allContentItems.filter((item) => item.status === 'Deleted')
        .length,
    }),
    [allContentItems],
  )

  return (
    <>
      {/* Delete Confirmation Dialog - handles both single and bulk deletion */}
      <DeleteConfirmationDialog
        isOpen={showBulkDeleteDialog || !!itemToDelete}
        onClose={() => {
          setShowBulkDeleteDialog(false)
          setItemToDelete(null)
        }}
        onConfirm={showBulkDeleteDialog ? confirmDeleteSelected : handleDelete}
        item={itemToDelete}
        itemCount={showBulkDeleteDialog ? selectedContentIds.length : undefined}
        itemType="document"
      />

      {/* View Modal */}
      {viewingDocumentId && (
        <ViewPublicationModal
          isOpen={!!viewingDocumentId}
          documentId={viewingDocumentId}
          onClose={() => {
            setViewingDocumentId(null)
            setViewingDocumentStatus(null)
          }}
          onAccept={handleAccept}
          onReject={handleReject}
          onRestore={handleRestore}
          onDeleteRequest={(id) => {
            const item = allContentItems.find((i) => i.id === id)
            if (item) {
              setItemToDelete(item)
            }
          }}
          documentStatus={viewingDocumentStatus || undefined}
        />
      )}

      <div className="space-y-8">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <ContentManagementHeader />
          <ContentTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={counts}
          />
          {loading ? (
            <div className="mt-6 py-10 text-center text-gray-500">
              Loading documents...
            </div>
          ) : error ? (
            <div className="mt-6 py-10 text-center text-red-600">{error}</div>
          ) : (
            <>
              {selectedContentIds.length > 0 && (
                <div className="mt-4 flex items-center justify-between rounded-lg bg-red-50 px-4 py-3">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedContentIds.length} document(s) selected
                  </span>
                  <button
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-2 rounded-lg bg-pup-maroon px-4 py-2 text-sm font-medium text-white hover:bg-pup-maroon/90 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete all
                  </button>
                </div>
              )}
              <ContentTable
                items={paginatedItems}
                selectedContentIds={selectedContentIds}
                onSelectAll={handleSelectAll}
                onSelectContent={handleSelectContent}
                onView={handleView}
                onAccept={handleAccept}
                onReject={handleReject}
                onRestore={handleRestore}
                onDeleteRequest={handleDeleteRequest}
              />
              <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)}{' '}
                  of {filteredItems.length} {activeTab.toLowerCase()} items
                </div>
                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (currentPage > 1) {
                              setCurrentPage(currentPage - 1)
                            }
                          }}
                          className={
                            currentPage === 1
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>
                      {getPageNumbers().map((page, index) => {
                        if (page === 'ellipsis') {
                          return (
                            <PaginationItem key={`ellipsis-${index}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )
                        }
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage(page)
                              }}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      })}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (currentPage < totalPages) {
                              setCurrentPage(currentPage + 1)
                            }
                          }}
                          className={
                            currentPage === totalPages
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
