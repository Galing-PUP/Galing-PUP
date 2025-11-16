"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import Image from "next/image";
import LogoDefault from "@/assets/Logo/logo-default.png";

type NavItem = {
  label: string;
  href: string;
  exact?: boolean;
};

type ActionLink = {
  href: string;
  label: string;
};

type HeaderProps = {
  navItems?: NavItem[];
  signIn?: ActionLink;
  primaryAction?: ActionLink;
  className?: string;
};

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", exact: true },
  { label: "Browse", href: "/search-results" },
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

export function Header({
  navItems = DEFAULT_NAV_ITEMS,
  signIn = DEFAULT_SIGN_IN,
  primaryAction = DEFAULT_PRIMARY_ACTION,
  className = "",
}: HeaderProps) {
  const pathname = usePathname();

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

  return (
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
                      ? "font-medium border-b-2 border-yellow-400 text-[#6b0504]"
                      : "text-gray-500 hover:text-gray-900"
                  }
                `}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Authentication Buttons (Sign In, Create Account) */}
        <div className="hidden items-center justify-self-end gap-4 md:flex col-start-3 col-end-4">
          <Link
            href={signIn.href}
            className="flex items-center gap-2 text-sm font-bold text-red-700 transition-colors duration-200 hover:text-gray-900"
          >
            <svg
              aria-hidden
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor" 
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z" />
              <path d="M20.59 21a8 8 0 0 0-17.18 0" />
            </svg>
            <span>{signIn.label}</span>
          </Link>

          <Link
            href={primaryAction.href}
            className="rounded-full bg-[#6b0504] px-5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#4a0403]"
          >
            {primaryAction.label}
          </Link>
        </div>

        {/* Mobile Menu (Toggle Navigation) */}
        <div className="flex items-center justify-self-end md:hidden">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-[#1F2937]"
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
  );
}

export default Header;