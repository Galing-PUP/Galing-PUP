"use client";

import { Sidebar } from "@/components/admin/sidebar";
import { RoleName } from "@/lib/generated/prisma/enums";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

type UserProfile = {
    username: string | null;
    email: string;
    tierName: string;
    role: RoleName;
} | null;

export function AdminLayoutShell({
    children,
    user,
}: {
    children: React.ReactNode;
    user: UserProfile;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const isAuthPage = pathname === "/admin/signin" || pathname === "/admin/request-access";

    useEffect(() => {
        if (isAuthPage) return;

        if (!user) {
            toast.error("Please sign in to access the admin panel via shell.");
            router.replace("/admin/signin");
            return;
        }

        const isAdmin = user.role === RoleName.ADMIN || user.role === RoleName.SUPERADMIN;

        if (!isAdmin) {
            toast.error("Access denied. Admin privileges required.");
            router.replace("/"); // Redirect unauthorized users to home
        }
    }, [user, isAuthPage, router]);

    if (isAuthPage) {
        return <>{children}</>;
    }

    // General Admin Check
    const isAdmin = user && (user.role === RoleName.ADMIN || user.role === RoleName.SUPERADMIN);
    if (!user || !isAdmin) {
        return null; // Handling via useEffect redirect, returning null to prevent flash
    }

    // Specific Route Protection for Non-Superadmins
    const isSuperAdmin = user.role === RoleName.SUPERADMIN;
    // Check if the current path matches any of the restricted paths
    // Using startsWith to cover sub-routes (e.g., /admin/users/123)
    const isRestrictedPath = pathname.startsWith("/admin/users") || pathname.startsWith("/admin/approval");

    if (!isSuperAdmin && isRestrictedPath) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-pup-maroon">403</h1>
                    <p className="text-xl text-gray-600">Forbidden: Super Admin access required.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar role={user.role} />
            <main className="flex-1 overflow-y-auto p-8">
                {/* Page content will be injected here */}
                {children}
            </main>
        </div>
    );
}
