"use client";

import LogoYellow from "@/assets/Logo/logo-yellow.png";
import StarLogo from "@/assets/Logo/star-logo-yellow.png";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentType, SVGProps, useMemo, useState } from "react";

import { Archive, FileText, LogOut, Upload, User } from "lucide-react";

// Props for the navigation item
type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  exact?: boolean;
};

// nav items for the sidebar
const NAV_ITEMS: NavItem[] = [
  {
    label: "Submit Publication",
    href: "/admin/upload",
    icon: Upload,
  },
  {
    label: "Published Works",
    href: "/admin/publication",
    icon: Archive,
  },
  {
    label: "User Role Manager",
    href: "/admin/users",
    icon: User,
  },
  {
    label: "Content Approval",
    href: "/admin/approval",
    icon: FileText,
  },
];

const SIGN_OUT_ITEM: NavItem = {
  label: "Sign Out",
  href: "/",
  icon: LogOut,
  exact: true,
};

export function Sidebar() {
  const pathname = usePathname();
  // State: Controls sidebar expansion (collapsed: 96px, expanded: 280px)
  const [isExpanded, setIsExpanded] = useState(false);

  // Active link calculation: Determines which nav item matches current route
  const activeLookup = useMemo(() => {
    const map = new Map<string, boolean>();

    NAV_ITEMS.forEach((item) => {
      if (item.exact) {
        map.set(item.href, pathname === item.href);
        return;
      }
      map.set(item.href, pathname.startsWith(item.href));
    });

    return map;
  }, [pathname]);

  return (
    // Main sidebar container: Full height, responsive width based on expansion state
    <aside
      className={`
        flex h-screen flex-col bg-pup-maroon text-pup-gold-light
        transition-all duration-300
        ${isExpanded ? "w-70 p-6" : "w-24 p-4"}
      `}
    >
      {/* Header/Logo Section: Clickable toggle for expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 mb-10 flex flex-col items-center"
      >
        {/* Logo: Shows full logo when expanded, star icon when collapsed */}
        <Image
          src={isExpanded ? LogoYellow : StarLogo}
          alt="Galing PUP Logo"
          className={`
            h-auto mt-5 transition-all duration-300
            ${isExpanded ? "w-55" : "w-10"}
          `}
          priority
        />
        {/* Admin Badge: Only visible when sidebar is expanded */}
        {isExpanded && (
          <p className="text-sm font-bold tracking-widest text-pup-gold-light/80">
            SUPER ADMIN
          </p>
        )}
      </button>

      {/* Navigation Links: Main menu items (Upload, Publications, Users, Approval) */}
      <nav className="flex-1 space-y-6">
        {NAV_ITEMS.map((item) => {
          const isActive = activeLookup.get(item.href) ?? false;
          const Icon = item.icon;
          return (
            // Nav Item: Shape changes based on expansion (rounded-lg vs rounded-full)
            <Link
              key={item.href}
              href={item.href}
              className={`
                group relative flex items-center font-bold transition-all duration-200
                ${isExpanded
                  ? "justify-between rounded-lg p-3 px-4"
                  : "justify-center rounded-full p-2 w-fit mx-auto"
                }
                ${isActive
                  ? "bg-pup-gold-light text-pup-maroon"
                  : "text-pup-gold-light hover:bg-black/20 hover:text-pup-gold-dark"
                }
              `}
            >
              {/* Label Text: Only shown when expanded, color changes based on active state */}
              {isExpanded && (
                <span
                  className={`mr-4 flex-1 whitespace-nowrap text-right ${isActive ? "text-pup-maroon" : "text-pup-gold-dark"
                    }`}
                >
                  {item.label}
                </span>
              )}
              {/* Icon Container: Circular background, darker when active */}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isActive ? "bg-pup-maroon" : "bg-black/60"
                  }`}
              >
                <Icon
                  className={`h-5 w-5 ${isActive ? "text-pup-gold-light" : "text-pup-gold-dark"
                    }`}
                />
              </div>
              {/* Tooltip: Appears on hover when sidebar is collapsed */}
              {!isExpanded && (
                <span
                  className="
                    pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2
                    rounded-md border border-pup-gold-dark/70 bg-pup-gold-light px-3 py-1
                    text-xs font-semibold uppercase tracking-wide text-pup-maroon shadow-lg
                    opacity-0 transition-opacity duration-200 group-hover:opacity-100
                  "
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out Button: Pinned to bottom, separate from main navigation */}
      <Link
        href={SIGN_OUT_ITEM.href}
        className={`
          group relative flex items-center font-bold transition-all duration-200
          ${isExpanded
            ? "justify-between rounded-lg p-3 px-4"
            : "justify-center rounded-full p-2 w-fit mx-auto"
          }
          text-pup-gold-light hover:bg-black/20 hover:text-pup-gold-dark
        `}
      >
        {/* Sign Out Label: Only visible when expanded */}
        {isExpanded && (
          <span className="mr-4 flex-1 whitespace-nowrap text-right text-pup-gold-dark">
            {SIGN_OUT_ITEM.label}
          </span>
        )}
        {/* Sign Out Icon: Circular container with logout icon */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 transition-colors">
          <LogOut className="h-5 w-5 text-pup-gold-dark" />
        </div>
        {/* Sign Out Tooltip: Shows label on hover when collapsed */}
        {!isExpanded && (
          <span
            className="
              pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2
              rounded-md border border-pup-gold-dark/70 bg-pup-gold-light px-3 py-1
              text-xs font-semibold uppercase tracking-wide text-pup-maroon shadow-lg
              opacity-0 transition-opacity duration-200 group-hover:opacity-100
            "
          >
            {SIGN_OUT_ITEM.label}
          </span>
        )}
      </Link>
    </aside>
  );
}
