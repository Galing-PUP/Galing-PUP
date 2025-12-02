"use client";

import Link from "next/link";
import Image from "next/image";
import LogoYellow from "@/assets/Logo/logo-yellow.png";
import StarLogo from "@/assets/Logo/star-logo-yellow.png";
import { usePathname } from "next/navigation";
import { useMemo, useState, SVGProps, ComponentType } from "react";

import { Upload, Archive, User, FileText, LogOut } from "lucide-react";

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
                flex items-center font-bold
                transition-all duration-200 text-yellow-100 
                ${
                  isExpanded
                    ? "justify-between rounded-lg p-3 px-4" 
                    : "justify-center rounded-full p-1"  
                }
                ${
                  isActive
                    ? "bg-yellow-400 font-bold" 
                    : "hover:bg-black/20 hover:text-yellow-500" 
                }
              `}
            >
              {isExpanded && (
                <span className={`flex-1 text-right mr-4 whitespace-nowrap ${
                  isActive ? "text-black" : "text-yellow-500"
                }`}>
                  {item.label}
                </span>
              )}
              {/* This DIV is always 40x40 and a circle */}
              <div className="h-[40px] w-[40px] rounded-full bg-[#993333] flex items-center justify-center">
                <Icon className="text-[#360000]" />
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button at Bottom */}
      <Link
        href="/signout"
        className={`
          flex items-center font-bold mt-auto
          transition-all duration-200 text-yellow-100 
          ${
            isExpanded
              ? "justify-between rounded-lg p-3 px-4" 
              : "justify-center rounded-full p-1"  
          }
          hover:bg-black/20 hover:text-yellow-500
        `}
      >
        {isExpanded && (
          <span className="flex-1 text-right mr-4 whitespace-nowrap text-yellow-500">
            Sign Out
          </span>
        )}
        <div className="h-[40px] w-[40px] rounded-full bg-[#993333] flex items-center justify-center">
          <LogOut className="text-[#360000]" />
        </div>
      </Link>
    </aside>
  );
}