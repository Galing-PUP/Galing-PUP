import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * fetch all users
 * @returns nextjs formatted response of all users
 */
export async function GET() {
    try {
        const users = await prisma.user.findMany({
            include: {
                role: true,
            },
            orderBy: {
                id: "asc",
            },
        });

        const formattedUsers = users.map((user) => ({
            id: user.id.toString(),
            name: user.username,
            email: user.email,
            // fallbacks to user if the user has no role
            role: user.role?.roleName || "User",
            status: user.isVerified ? "Accepted" : "Pending",
        }));

        return NextResponse.json(formattedUsers);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    /**
     * API for deleting users entry
     * @param request 
     * @returns nextjs formatted response of deleted users
     */
    try {
        const body = await request.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { error: "Invalid or empty IDs" },
                { status: 400 }
            );
        }

        // Parse IDs to integers
        const userIds = ids
            .map((id) => parseInt(id))
            .filter((id) => !isNaN(id));

        if (userIds.length === 0) {
            return NextResponse.json(
                { error: "No valid IDs provided" },
                { status: 400 }
            );
        }


        // Fetch users to get their Supabase Auth IDs
        const usersToDelete = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { supabaseAuthId: true },
        });

        // Delete from Supabase Auth
        // We do this before the DB transaction. If it fails, we log it but proceed with DB deletion
        // to ensure at least local data is cleaned up. Ideally, both or nothing, but Auth API isn't transactional with DB.
        for (const user of usersToDelete) {
            if (user.supabaseAuthId) {
                const { error } = await supabaseAdmin.auth.admin.deleteUser(user.supabaseAuthId);
                if (error) {
                    console.error(`Failed to delete user ${user.supabaseAuthId} from Supabase Auth:`, error);
                }
            }
        }

        // Perform cascading delete in a transaction
        await prisma.$transaction(async (tx) => {
            // 1. Delete activity logs for all users
            await tx.activityLog.deleteMany({
                where: { userId: { in: userIds } },
            });

            // 2. Delete bookmarks for all users
            await tx.userBookmark.deleteMany({
                where: { userId: { in: userIds } },
            });

            // 3. Handle uploaded documents
            const userDocuments = await tx.document.findMany({
                where: { uploaderId: { in: userIds } },
                select: { id: true },
            });

            const documentIds = userDocuments.map((doc) => doc.id);

            if (documentIds.length > 0) {
                // Delete related data for these documents
                await tx.userBookmark.deleteMany({
                    where: { documentId: { in: documentIds } },
                });

                await tx.activityLog.deleteMany({
                    where: { documentId: { in: documentIds } },
                });

                await tx.documentAuthor.deleteMany({
                    where: { documentId: { in: documentIds } },
                });

                await tx.documentKeyword.deleteMany({
                    where: { documentId: { in: documentIds } },
                });

                await tx.document.deleteMany({
                    where: { id: { in: documentIds } },
                });
            }

            // 4. Finally delete the users
            await tx.user.deleteMany({
                where: { id: { in: userIds } },
            });
        });

        return NextResponse.json({ success: true, count: userIds.length });
    } catch (error: any) {
        console.error("Error bulk deleting users:", error);
        return NextResponse.json(
            { error: "Failed to delete users", details: error.message },
            { status: 500 }
        );
    }
}
