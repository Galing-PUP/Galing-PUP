import { SearchBar } from '@/components/search-bar'
import type { UserRole, UserStatus } from '@/types/users'
import { FilterDropdown } from './filter-dropdown'

type UserToolbarProps = {
  selectedStatuses: UserStatus[]
  selectedRoles: UserRole[]
  onStatusChange: (statuses: UserStatus[]) => void
  onRoleChange: (roles: UserRole[]) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

const statusOptions = [
  { label: 'Accepted', value: 'Accepted' as UserStatus },
  { label: 'Pending', value: 'Pending' as UserStatus },
  { label: 'Delete', value: 'Delete' as UserStatus },
]

const roleOptions = [
  { label: 'Super Admin', value: 'Superadmin' as UserRole },
  { label: 'Admin', value: 'Admin' as UserRole },
  { label: 'Registered', value: 'Registered' as UserRole },
]

export function UserToolbar({
  selectedStatuses,
  selectedRoles,
  onStatusChange,
  onRoleChange,
  searchQuery,
  onSearchChange,
}: UserToolbarProps) {
  return (
    <div className="mt-6 flex flex-col items-stretch gap-4 md:flex-row">
      <div className="flex-1">
        <SearchBar
          placeholder="Search users by username or email..."
          size="sm"
          value={searchQuery}
          onChange={onSearchChange}
          onSubmit={() => {}}
        />
      </div>
      <FilterDropdown
        label="Filter by Status"
        options={statusOptions}
        selectedValues={selectedStatuses}
        onChange={onStatusChange}
      />
      <FilterDropdown
        label="Filter by Role"
        options={roleOptions}
        selectedValues={selectedRoles}
        onChange={onRoleChange}
      />
    </div>
  )
}
