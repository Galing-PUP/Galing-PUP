'use client'

import LogoYellow from '@/assets/Logo/logo-yellow.png'
import StarLogo from '@/assets/Logo/star-logo-yellow.png'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ComponentType, SVGProps, useMemo, useState } from 'react'

import { signOut } from '@/lib/actions'
import { Archive, FileText, Loader2, LogOut, Upload, User } from 'lucide-react'
import { toast } from 'sonner'

import { RoleName } from '@/lib/generated/prisma/enums'

type NavItem = {
  label: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  exact?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Submit Publication', href: '/admin/upload', icon: Upload },
  { label: 'Publication List', href: '/admin/publication', icon: Archive },
  { label: 'Content Approval', href: '/admin/approval', icon: FileText },
  { label: 'User Role Manager', href: '/admin/users', icon: User },
]

const SIGN_OUT_ITEM: NavItem = {
  label: 'Sign Out',
  href: '#',
  icon: LogOut,
  exact: true,
}

/**
 * Reusable navigation link component for sidebar items
 */
function NavLink({
  item,
  isActive = false,
  isExpanded,

  onClick,
  isLoading = false,
}: {
  item: NavItem
  isActive?: boolean
  isExpanded: boolean

  onClick?: () => void
  isLoading?: boolean
}) {
  const Icon = item.icon

  // Base container styles with conditional width/rounding/colors
  const containerClasses = `
    group relative flex items-center font-bold transition-all duration-200
    ${isExpanded ? 'justify-between rounded-lg p-3 px-4' : 'justify-center rounded-full p-2 w-fit mx-auto'}
    ${isActive ? 'bg-pup-gold-light text-pup-maroon' : 'text-pup-gold-light hover:bg-black/20 hover:text-pup-gold-dark'}
    ${onClick ? 'cursor-pointer' : ''}
    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
  `

  // Icon container and color logic
  const iconClasses = `flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isActive ? 'bg-pup-maroon' : 'bg-black/60'
    }`
  const iconColorClasses = `h-5 w-5 ${isActive ? 'text-pup-gold-light' : 'text-pup-gold-dark'}`

  // Label text styles (shown when expanded)
  const labelClasses = `mr-4 flex-1 whitespace-nowrap text-right ${isActive ? 'text-pup-maroon' : 'text-pup-gold-dark'
    }`

  // Hover tooltip styles (shown when collapsed)
  const tooltipClasses = `
    pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2
    rounded-md border border-pup-gold-dark/70 bg-pup-gold-light px-3 py-1
    text-xs font-semibold uppercase tracking-wide text-pup-maroon shadow-lg
    opacity-0 transition-opacity duration-200 group-hover:opacity-100
  `

  const content = (
    <>
      {isExpanded && (
        <span className={labelClasses}>
          {isLoading && item.label === 'Sign Out'
            ? 'Signing out...'
            : item.label}
        </span>
      )}
      <div className={iconClasses}>
        {isLoading && item.label === 'Sign Out' ? (
          <Loader2 className={`${iconColorClasses} animate-spin`} />
        ) : (
          <Icon className={iconColorClasses} />
        )}
      </div>
      {/* Tooltip on hover when collapsed */}
      {!isExpanded && (
        <span className={tooltipClasses}>
          {isLoading && item.label === 'Sign Out'
            ? 'Signing out...'
            : item.label}
        </span>
      )}
    </>
  )

  if (onClick) {
    return (
      <button
        onClick={onClick}
        disabled={isLoading}
        className={containerClasses}
      >
        {content}
      </button>
    )
  }

  return (
    <Link href={item.href} className={containerClasses}>
      {content}
    </Link>
  )
}

export function Sidebar({ role }: { role?: RoleName }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const filteredItems = useMemo(() => {
    if (role === RoleName.SUPERADMIN || role === RoleName.OWNER) {
      return NAV_ITEMS
    }
    return NAV_ITEMS.filter(
      (item) =>
        item.label === 'Submit Publication' ||
        item.label === 'Publication List',
    )
  }, [role])

  // Pre-calculate active status for all nav items
  const activeLookup = useMemo(() => {
    const map = new Map<string, boolean>()
    filteredItems.forEach((item) => {
      map.set(
        item.href,
        item.exact ? pathname === item.href : pathname.startsWith(item.href),
      )
    })
    return map
  }, [pathname, filteredItems])

  /**
   * Handles admin sign out with a smooth transition.
   * Shows loading state and toast notification before redirecting.
   */
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      toast.loading('Signing out...', { id: 'signout' })
      await signOut()
      toast.success('Signed out successfully', { id: 'signout' })
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out. Please try again.', { id: 'signout' })
      setIsSigningOut(false)
    }
  }

  return (
    <aside
      className={`flex h-screen flex-col bg-pup-maroon text-pup-gold-light transition-all duration-300 ${isExpanded ? 'w-70 p-6' : 'w-24 p-4'
        }`}
    >
      {/* Logo/Toggle Section */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 mb-10 flex flex-col items-center"
      >
        <Image
          src={isExpanded ? LogoYellow : StarLogo}
          alt="Galing PUP Logo"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          className={`h-auto mt-5 transition-all duration-300 ${isExpanded ? 'w-55' : 'w-10'
            }`}
          priority
        />
        {isExpanded && role === RoleName.SUPERADMIN && (
          <p className="text-sm font-bold tracking-widest text-pup-gold-light/80">
            SUPER ADMIN
          </p>
        )}
      </button>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-6">
        {filteredItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={activeLookup.get(item.href) ?? false}
            isExpanded={isExpanded}
          />
        ))}
      </nav>

      {/* Bottom Action Section */}
      <NavLink
        item={SIGN_OUT_ITEM}
        isExpanded={isExpanded}
        onClick={handleSignOut}
        isLoading={isSigningOut}
      />
    </aside>
  )
}
