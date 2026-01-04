"use client";

import { Sidebar } from "@/components/admin/sidebar";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  {/*bypass sidebar for sign in page*/ }
  const isAuthPage = pathname === "/admin/signin" || pathname === "/admin/request-access";
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {/* Page content will be injected here */}
        {children}
      </main>
    </div>
  );
}