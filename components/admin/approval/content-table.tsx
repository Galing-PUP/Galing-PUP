'use client'

import type { ContentItem } from '@/types/content'
import { Check, Eye, RotateCcw, Trash2, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { ResourceTypeBadge } from './resource-type-badge'
import { StatusBadge } from './status-badge'

type ContentTableProps = {
  items: ContentItem[]
  selectedContentIds: string[]
  onSelectAll: () => void
  onSelectContent: (contentId: string) => void
  onView: (item: ContentItem) => void
  onAccept: (itemId: string) => void
  onReject: (itemId: string) => void
  onRestore?: (itemId: string) => void
  onDeleteRequest: (item: ContentItem) => void
}

export function ContentTable({
  items,
  selectedContentIds,
  onSelectAll,
  onSelectContent,
  onView,
  onAccept,
  onReject,
  onRestore,
  onDeleteRequest,
}: ContentTableProps) {
  const headerCheckboxRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (headerCheckboxRef.current) {
      const numSelected = selectedContentIds.length
      const numItems = items.length
      headerCheckboxRef.current.checked =
        numSelected === numItems && numItems > 0
      headerCheckboxRef.current.indeterminate =
        numSelected > 0 && numSelected < numItems
    }
  }, [selectedContentIds, items.length])
  return (
    <div className="mt-4 flow-root">
      <div className="-mx-6 -my-2 overflow-x-auto">
        <div className="inline-block min-w-[1200px] w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="mb-2 rounded-lg bg-gray-100 px-4 py-3">
            <div className="grid grid-cols-12 items-center gap-3 text-left text-sm font-semibold text-gray-600">
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  ref={headerCheckboxRef}
                  onChange={onSelectAll}
                  className="h-4 w-4 rounded border-gray-400 text-pup-maroon focus:ring-pup-maroon"
                />
              </div>
              <div className="col-span-2">Resource Type</div>
              <div className="col-span-3">Publication Title</div>
              <div className="col-span-2">Author</div>
              <div className="col-span-1">Submitted</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2 text-center">Actions</div>
            </div>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`grid grid-cols-12 items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                  selectedContentIds.includes(item.id)
                    ? 'bg-red-50'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedContentIds.includes(item.id)}
                    onChange={() => onSelectContent(item.id)}
                    className="h-4 w-4 rounded border-gray-400 text-pup-maroon focus:ring-pup-maroon"
                  />
                </div>
                <div className="col-span-2">
                  <ResourceTypeBadge type={item.resourceType} />
                </div>
                <div className="col-span-3 truncate text-sm font-medium text-gray-800">
                  {item.title}
                </div>
                <div className="col-span-2 truncate text-sm text-gray-600">
                  {item.authors}
                </div>
                <div className="col-span-1 whitespace-nowrap text-sm text-gray-600">
                  {item.submittedDate}
                </div>
                <div className="col-span-1">
                  <StatusBadge status={item.status} />
                </div>

                <div className="col-span-2 flex justify-center space-x-1">
                  <button
                    title="View Details"
                    onClick={() => onView(item)}
                    className="rounded-full p-2 text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  {item.status === 'Deleted' ? (
                    <>
                      <button
                        title="Permanently Delete"
                        onClick={() => onDeleteRequest(item)}
                        className="rounded-full p-2 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </>
                  ) : item.status === 'Rejected' ? (
                    <>
                      {onRestore && (
                        <button
                          title="Restore to Pending"
                          onClick={() => onRestore(item.id)}
                          className="rounded-full p-2 text-purple-600 hover:bg-purple-100 transition-colors"
                        >
                          <RotateCcw className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        title="Accept"
                        onClick={() => onAccept(item.id)}
                        className="rounded-full p-2 text-green-600 hover:bg-green-100 transition-colors"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => onDeleteRequest(item)}
                        className="rounded-full p-2 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        title="Accept"
                        onClick={() => onAccept(item.id)}
                        disabled={item.status === 'Accepted'}
                        className="rounded-full p-2 text-green-600 hover:bg-green-100 transition-colors disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-transparent"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        title="Reject"
                        onClick={() => onReject(item.id)}
                        className="rounded-full p-2 text-orange-500 hover:bg-orange-100 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => onDeleteRequest(item)}
                        className="rounded-full p-2 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
