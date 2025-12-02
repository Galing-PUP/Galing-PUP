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
  {
    label: "Sign Out",
    href: "/",
    icon: LogOut,
    exact: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  // Use useMemo to calculate active links
  const activeLookup = useMemo(() => {
    const map = new Map<string, boolean>();

    // Use the updated NAV_ITEMS array
    NAV_ITEMS.forEach((item) => {
      if (item.exact) {
        map.set(item.href, pathname === item.href);
        return;
      }
      map.set(item.href, pathname.startsWith(item.href));
    });

    return map;
  }, [pathname, NAV_ITEMS]);

  return (
    <aside
      className={`
        flex h-screen flex-col bg-[#360000] p-6 text-yellow-100
        transition-all duration-300
        ${isExpanded ? "w-70" : "w-24"}
      `}
    >
      {/* Header/Logo Section */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 mb-10 flex flex-col items-center"
      >
        <Image
          src={isExpanded ? LogoYellow : StarLogo}
          alt="Galing PUP Logo"
          className={`
            h-auto mt-5 transition-all duration-300
            ${isExpanded ? "w-55" : "w-10"}
          `}
          priority
        />
        {isExpanded && (
          <p className="text-sm font-bold tracking-widest text-yellow-200/80">
            SUPER ADMIN
          </p>
        )}
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-6">
        {NAV_ITEMS.map((item) => {
          const isActive = activeLookup.get(item.href) ?? false;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group relative flex items-center font-bold transition-all duration-200
                ${
                  isExpanded
                    ? "justify-between rounded-lg p-3 px-4"
                    : "justify-center rounded-full p-2"
                }
                ${
                  isActive
                    ? "bg-yellow-100 text-[#360000]"
                    : "text-yellow-100 hover:bg-black/20 hover:text-yellow-500"
                }
              `}
            >
              {isExpanded && (
                <span
                  className={`mr-4 flex-1 whitespace-nowrap text-right ${
                    isActive ? "text-[#360000]" : "text-yellow-500"
                  }`}
                >
                  {item.label}
                </span>
              )}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  isActive ? "bg-[#360000]" : "bg-[#993333]"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? "text-yellow-200" : "text-[#360000]"
                  }`}
                />
              </div>
              {!isExpanded && (
                <span
                  className="
                    pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2
                    rounded-md border border-yellow-300/70 bg-yellow-100 px-3 py-1
                    text-xs font-semibold uppercase tracking-wide text-[#360000] shadow-lg
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
    </aside>
  );
}
