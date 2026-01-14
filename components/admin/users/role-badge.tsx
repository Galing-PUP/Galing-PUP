import type { UserRole } from '@/types/users'

type RoleBadgeProps = {
  role: UserRole
}

/**
 * Renders a styled badge for user roles
 * Displays role with appropriate color scheme matching the design
 */
export function RoleBadge({ role }: RoleBadgeProps) {
  // Normalize role to handle different cases
  const normalizedRole = role?.toString().toLowerCase()

  const getStyle = () => {
    if (normalizedRole === 'superadmin') {
      return 'bg-pup-maroon text-white'
    }
    if (normalizedRole === 'admin') {
      return 'bg-pup-gold-light text-gray-900'
    }
    if (normalizedRole === 'registered') {
      return 'bg-gray-200 text-gray-700'
    }
    return 'bg-gray-100 text-gray-600'
  }

  const getLabel = () => {
    if (normalizedRole === 'superadmin') {
      return 'Super Admin'
    }
    if (normalizedRole === 'admin') {
      return 'Admin'
    }
    if (normalizedRole === 'registered') {
      return 'Registered'
    }
    if (normalizedRole === 'viewer') {
      return 'Viewer'
    }
    return role
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStyle()}`}
    >
      {getLabel()}
    </span>
  )
}
