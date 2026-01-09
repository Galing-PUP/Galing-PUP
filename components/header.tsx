"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import LogoDefault from "@/assets/Logo/logo-default.png";
import { SignInModal } from "./SignInModal";
import { getCurrentUser, signOut } from "@/lib/actions";
import { User } from "lucide-react";
import { formatTier } from "@/lib/utils/format";
import { TierName } from "@/lib/generated/prisma/enums";

type NavItem = {
  label: string;
  href: string;
  exact?: boolean;
};

type ActionLink = {
  href: string;
  label: string;
};

type UserProfile = {
  username: string;
  tierName: TierName;
  email: string;
};

type HeaderProps = {
  navItems?: NavItem[];
  signIn?: ActionLink;
  primaryAction?: ActionLink;
  className?: string;
  initialUser?: UserProfile | null;
};

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", exact: true },
  { label: "Browse", href: "/browse" },
  { label: "My Library", href: "/library" },
  { label: "Pricing", href: "/pricing" },
];

const DEFAULT_SIGN_IN: ActionLink = {
  href: "/signin",
  label: "Sign In",
};

const DEFAULT_PRIMARY_ACTION: ActionLink = {
  href: "/signup",
  label: "Create Account",
};

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
  className = "",
  initialUser = null,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setUser(null);
    setIsDropdownOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  };

  const activeLookup = useMemo(() => {
    const map = new Map<string, boolean>();

    navItems.forEach((item) => {
      if (item.exact) {
        map.set(item.href, pathname === item.href);
        return;
      }
      map.set(item.href, pathname.startsWith(item.href));
    });

    return map;
  }, [navItems, pathname]);

  // Get initials for avatar placeholder
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // hides the header for admin pages, sign in, and sign up pages
  if (
    pathname.startsWith("/admin") ||
    pathname === "/signin" ||
    pathname === "/signup" ||
    pathname === "/verify-otp" ||
    pathname === "/forgot-password" ||
    pathname === "/update-password"
  ) {
    return null;
  }

  return (
    <>
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
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
              className="h-7 w-auto sm:h-8 md:h-9"
              priority
            />
          </Link>

          {/* Navigation Links (Home, Browse, My Library, Pricing) */}
          <nav className="hidden items-center justify-center gap-10 text-sm font-medium md:flex md:justify-self-center col-start-2 col-end-3">
            {navItems.map((item) => {
              const isActive = activeLookup.get(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`pb-1 transition-colors duration-200
                  ${
                    isActive
                      ? "font-medium border-b-2 border-pup-gold-light text-pup-maroon"
                      : "text-gray-500 hover:text-gray-900"
                  }
                `}
                >
                  {item.label}
                </Link>
              );
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
                        // TODO: Navigate to user preferences
                        setIsDropdownOpen(false);
                      }}
                    >
                      User preferences
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-pup-maroon hover:bg-gray-100 font-medium"
                      onClick={handleSignOut}
                    >
                      Logout
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

          {/* Mobile Menu (Toggle Navigation) */}
          <div className="flex items-center justify-self-end md:hidden">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-gray-700"
              aria-label="Toggle navigation menu"
            >
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
