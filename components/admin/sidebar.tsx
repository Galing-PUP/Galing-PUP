"use client";

import Link from "next/link";
import Image from "next/image";
import LogoYellow from "@/assets/Logo/logo-yellow.png";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
  UploadCloud,
  Archive,
  Users,
  FileCheck,
  LogOut,
  LucideIcon,
} from "lucide-react";

// Props for the navigation item
type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

// nav items for the sidebar
const NAV_ITEMS: NavItem[] = [
  {
    label: "Submit Publication",
    href: "/admin/submit",
    icon: UploadCloud,
  },
  {
    label: "Published Works",
    href: "/admin/works",
    icon: Archive,
  },
  {
    label: "User Role Manager",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Content Approval",
    href: "/admin/approval",
    icon: FileCheck,
  },
   {
    label: "Sign Out",
    href: "/signout",
    icon: LogOut,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  // Use useMemo to calculate active links
const activeLookup = useMemo(() => {
  const map = new Map<string, boolean>();

  [...NAV_ITEMS, { label: "Sign Out", href: "/signout", icon: LogOut }]
    .forEach((item) => {
      if (item.exact) {
        map.set(item.href, pathname === item.href);
        return;
      }
      map.set(item.href, pathname.startsWith(item.href));
    });

  return map;
}, [pathname]);
  return (
    <aside className="flex h-screen w-70 flex-col bg-[#360000] p-6 text-yellow-100">
      {/* Header/Logo Section */}
      <div className="mb-10 flex flex-col items-center">

        {/*TODO : replace the image with svg for clearer logo */}
       <Image
          src={LogoYellow}
          alt="Galing PUP Logo"
          className="h-auto w-55 mt-5" 
          priority 
        />
        <p className="text-sm font-bold tracking-widest text-yellow-200/80">
          SUPER ADMIN
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-3">
        {NAV_ITEMS.map((item) => {
          const isActive = activeLookup.get(item.href) ?? false;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center justify-between rounded-lg p-3 px-4 text-md font-bold
                transition-all duration-200 text-yellow-100
                ${
                  isActive
                    ? "bg-yellow-400 font-bold text-yellow-600" // Active state
                    : "hover:bg-black/20 hover:text-yellow-500" // Inactive state
                }
              `}
            >
              <span className="flex-1 text-right mr-4 whitespace-nowrap text-yellow-500">{item.label}</span>
              <div className="h-[40px] w-[40px] rounded-full bg-[#993333] flex items-center justify-center">
                    <Icon className="h-[20px] w-[20px] text-[#360000]" />
              </div>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}