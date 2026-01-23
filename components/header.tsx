'use client'

import LogoDefault from '@/assets/Logo/logo-default.png'
import { SignInModal } from '@/components/SignInModal'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { getCurrentUser, signOut } from '@/lib/actions'
import { RoleName, TierName } from '@/lib/generated/prisma/enums'
import { formatTier } from '@/lib/utils/format'
import { Loader2, Menu, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import UserPreferencesModal from './user-preferences-modal'

type NavItem = {
  label: string
  href: string
  exact?: boolean
}

type ActionLink = {
  href: string
  label: string
}

type UserProfile = {
  username: string
  tierName: TierName
  email: string
  role: RoleName
  isOAuthUser?: boolean
}

type HeaderProps = {
  navItems?: NavItem[]
  signIn?: ActionLink
  primaryAction?: ActionLink
  className?: string
  initialUser?: UserProfile | null
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', exact: true },
  { label: 'Browse', href: '/browse' },
  { label: 'My Library', href: '/library' },
  { label: 'Pricing', href: '/pricing' },
]

const DEFAULT_SIGN_IN: ActionLink = {
  href: '/signin',
  label: 'Sign In',
}

const DEFAULT_PRIMARY_ACTION: ActionLink = {
  href: '/signup',
  label: 'Create Account',
}

/**
 * Header component that displays navigation, authentication buttons, or user profile.
 * Handles responsive design and user session state.
 *
 * @param props - The component props.
 * @returns The rendered Header component.
 */
export function Header({
  navItems = DEFAULT_NAV_ITEMS,
  signIn = DEFAULT_SIGN_IN,
  primaryAction = DEFAULT_PRIMARY_ACTION,
  className = '',
  initialUser = null,
}: HeaderProps) {
  const pathname = usePathname()
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(initialUser)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setUser(initialUser)
  }, [initialUser])

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser()
        // Ensure userData matches UserProfile type (username should not be null)
        if (userData && userData.username) {
          setUser(userData as UserProfile)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
    fetchUser()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  /**
   * Handles user sign out with a smooth transition.
   * Shows loading state and toast notification before redirecting.
   */
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      setIsDropdownOpen(false)
      // Show toast notification
      toast.loading('Signing out...', { id: 'signout' })
      await signOut()
      toast.success('Signed out successfully', { id: 'signout' })
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out. Please try again.', { id: 'signout' })
    } finally {
      setIsSigningOut(false)
    }
  }

  const activeLookup = useMemo(() => {
    const map = new Map<string, boolean>()

    navItems.forEach((item) => {
      if (item.exact) {
        map.set(item.href, pathname === item.href)
        return
      }
      map.set(item.href, pathname.startsWith(item.href))
    })

    return map
  }, [navItems, pathname])

  // Get initials for avatar placeholder
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // hides the header for admin pages, sign in, and sign up pages
  if (
    pathname.startsWith('/admin') ||
    pathname === '/signin' ||
    pathname === '/signup' ||
    pathname === '/verify-otp' ||
    pathname === '/forgot-password' ||
    pathname === '/update-password' ||
    pathname === '/pricing/success'
  ) {
    return null
  }

  return (
    <>
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
      {user && (
        <UserPreferencesModal
          isOpen={isPreferencesOpen}
          onClose={() => setIsPreferencesOpen(false)}
          initialUsername={user.username}
          userRole={user.role}
          isOAuthUser={user.isOAuthUser}
          onUsernameUpdated={(nextUsername) => {
            setUser((prev) =>
              prev ? { ...prev, username: nextUsername } : prev,
            )
          }}
        />
      )}
      <header
        className={`w-full border-b border-neutral-200 bg-white ${className}`}
      >
        <div className="mx-auto w-full grid h-20 max-w-8xl grid-cols-3 items-center gap-4 px-4 md:gap-8 md:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 justify-self-start"
            aria-label="Galing PUP home"
          >
            <Image
              src={LogoDefault}
              alt="Galing PUP logo"
              className="h-7 w-auto sm:h-8 md:h-9 object-contain"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              priority
            />
          </Link>

          {/* Navigation Links (Home, Browse, My Library, Pricing) */}
          <nav className="hidden items-center justify-center gap-10 text-sm font-medium md:flex md:justify-self-center col-start-2 col-end-3">
            {navItems.map((item) => {
              const isActive = activeLookup.get(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`pb-1 transition-colors duration-200
                  ${
                    isActive
                      ? 'font-medium border-b-2 border-pup-gold-light text-pup-maroon'
                      : 'text-gray-500 hover:text-gray-900'
                  }
                `}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Authentication Buttons or User Profile */}
          <div className="hidden items-center justify-self-end gap-4 md:flex col-start-3 col-end-4">
            {user ? (
              <div
                className="flex items-center gap-3 relative"
                ref={dropdownRef}
              >
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-neutral-900 leading-tight">
                    {user.username}
                  </span>
                  <span className="text-xs text-neutral-500 font-medium">
                    {formatTier(user.tierName)} user
                  </span>
                </div>

                {/* User Avatar / Dropdown Trigger */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="h-10 w-10 rounded-full bg-pup-maroon text-white flex items-center justify-center text-sm font-bold hover:bg-pup-maroon transition-colors focus:outline-none focus:ring-2 focus:ring-pup-maroon focus:ring-offset-2"
                  aria-label="User menu"
                >
                  {/* TODO: Replace with actual user avatar image when available */}
                  {getInitials(user.username)}
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50">
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setIsPreferencesOpen(true)
                        setIsDropdownOpen(false)
                      }}
                    >
                      User preferences
                    </button>
                    <button
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-pup-maroon hover:bg-gray-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                    >
                      {isSigningOut ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Signing out...</span>
                        </>
                      ) : (
                        <span>Logout</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsSignInModalOpen(true)}
                  className="flex items-center gap-2 text-sm font-bold text-pup-maroon transition-colors duration-200 hover:bg-pup-maroon/10 px-3 py-2 rounded-full"
                >
                  <User />
                  <span>{signIn.label}</span>
                </button>

                <Link
                  href={primaryAction.href}
                  className="rounded-full bg-pup-maroon px-5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-pup-maroon/80"
                >
                  {primaryAction.label}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center justify-end md:hidden col-start-3">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  aria-label="Toggle navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-75 sm:w-100 flex flex-col"
              >
                <SheetHeader className="px-2">
                  <SheetTitle className="text-left">Menu</SheetTitle>
                  <SheetDescription className="text-left">
                    Navigate through the application
                  </SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col mt-6 space-y-2 px-2 flex-1">
                  {/* Navigation Links */}
                  {navItems.map((item) => {
                    const isActive = activeLookup.get(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200
                          ${
                            isActive
                              ? 'bg-pup-maroon/10 text-pup-maroon border-l-4 border-pup-gold-light'
                              : 'text-gray-700 hover:bg-gray-100'
                          }
                        `}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    )
                  })}

                  {/* Divider */}
                  <div className="py-4">
                    <div className="h-px bg-neutral-200" />
                  </div>

                  {/* User Section */}
                  {user ? (
                    <div className="space-y-3 mt-auto">
                      {/* User Info */}
                      <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-neutral-50">
                        <div className="h-12 w-12 shrink-0 rounded-full bg-pup-maroon text-white flex items-center justify-center text-base font-bold">
                          {getInitials(user.username)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-base font-semibold text-neutral-900 truncate">
                            {user.username}
                          </span>
                          <span className="text-sm text-neutral-500 font-medium">
                            {formatTier(user.tierName)} user
                          </span>
                        </div>
                      </div>

                      {/* User Actions */}
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-4 py-3 h-auto text-base font-medium text-gray-700 hover:bg-neutral-100"
                        onClick={() => {
                          setIsPreferencesOpen(true)
                          setIsMobileMenuOpen(false)
                        }}
                      >
                        User preferences
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-4 py-3 h-auto text-base font-medium text-pup-maroon hover:bg-red-50 disabled:opacity-50"
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                      >
                        {isSigningOut ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            <span>Signing out...</span>
                          </>
                        ) : (
                          <span>Logout</span>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 mt-auto">
                      <Button
                        variant="outline"
                        className="w-full justify-center gap-2 px-4 py-3 h-auto text-base font-semibold text-pup-maroon border-pup-maroon/30 hover:bg-pup-maroon/5"
                        onClick={() => {
                          setIsSignInModalOpen(true)
                          setIsMobileMenuOpen(false)
                        }}
                      >
                        <User className="h-5 w-5" />
                        <span>{signIn.label}</span>
                      </Button>
                      <Link
                        href={primaryAction.href}
                        className="block w-full text-center rounded-lg bg-pup-maroon px-4 py-3 text-base font-semibold text-white hover:bg-pup-maroon/90 transition-colors duration-200 active:scale-98"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {primaryAction.label}
                      </Link>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  )
}

export default Header
