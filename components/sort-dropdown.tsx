'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type SortOption =
  | 'Newest to Oldest'
  | 'Oldest to Newest'
  | 'Title A-Z'
  | 'Title Z-A'

type SortDropdownProps = {
  value?: SortOption
  onChange?: (value: SortOption) => void
  className?: string
}

export function SortDropdown({
  value = 'Newest to Oldest',
  onChange,
  className = '',
}: SortDropdownProps) {
  const handleValueChange = (newValue: string) => {
    if (onChange) {
      onChange(newValue as SortOption)
    }
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger className="h-10 min-w-[190px] rounded-full border border-pup-maroon/40 bg-white/80 px-4 py-2 text-sm font-semibold text-pup-maroon shadow-sm focus:outline-none focus:ring-0 focus:border-pup-maroon">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="z-40 rounded-2xl border-pup-maroon/30">
          <SelectItem value="Newest to Oldest">Newest to Oldest</SelectItem>
          <SelectItem value="Oldest to Newest">Oldest to Newest</SelectItem>
          <SelectItem value="Title A-Z">Title A-Z</SelectItem>
          <SelectItem value="Title Z-A">Title Z-A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export default SortDropdown
