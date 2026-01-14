'use client'

export type TabStatus = 'Pending' | 'Rejected' | 'Deleted'

interface ContentTabsProps {
  activeTab: TabStatus
  onTabChange: (tab: TabStatus) => void
  counts: {
    pending: number
    rejected: number
    deleted: number
  }
}

export function ContentTabs({
  activeTab,
  onTabChange,
  counts,
}: ContentTabsProps) {
  const getTabStyle = (tab: TabStatus) => {
    return activeTab === tab
      ? 'border-red-800 bg-red-50 text-red-800'
      : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-4 border-b border-gray-200 pb-4">
      <button
        onClick={() => onTabChange('Pending')}
        className={`flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${getTabStyle(
          'Pending',
        )}`}
      >
        Pending Review
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
          {counts.pending}
        </span>
      </button>

      <button
        onClick={() => onTabChange('Rejected')}
        className={`flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${getTabStyle(
          'Rejected',
        )}`}
      >
        Rejected
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white">
          {counts.rejected}
        </span>
      </button>

      <button
        onClick={() => onTabChange('Deleted')}
        className={`flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${getTabStyle(
          'Deleted',
        )}`}
      >
        Deleted
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-600 text-xs text-white">
          {counts.deleted}
        </span>
      </button>
    </div>
  )
}
