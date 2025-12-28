import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase/admin";


/**
 * helper function to get role id by role name
 * @param roleName - The role name
 * @returns The role id
 */
async function getRoleId(roleName: string) {
    const role = await prisma.role.findFirst({
        where: { roleName: roleName },
    });
    return role?.id;
}

/**
 * @param request - The incoming request
 * @param context - The context object containing the params
 */
export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idString } = await context.params;
        const id = parseInt(idString);
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // 1. Fetch user to check existence and get Supabase Auth ID
        const user = await prisma.user.findUnique({
            where: { id },
            select: { supabaseAuthId: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 2. Delete from Supabase Auth if ID exists
        if (user.supabaseAuthId) {
            const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user.supabaseAuthId);
            if (authError) {
                console.error(`Failed to delete user ${user.supabaseAuthId} from Supabase Auth:`, authError);
                // Continue to DB delete even if Auth delete fails
            }
        }

        // Perform a transaction to handle cascading deletes manually
        await prisma.$transaction(async (tx) => {
            // 1. Delete user's activity logs
            await tx.activityLog.deleteMany({
                where: { userId: id },
            });

            // 2. Delete user's bookmarks
            await tx.userBookmark.deleteMany({
                where: { userId: id },
            });

            // 3. Find documents uploaded by the user
            const userDocuments = await tx.document.findMany({
                where: { uploaderId: id },
                select: { id: true },
            });

            const documentIds = userDocuments.map((doc) => doc.id);

            if (documentIds.length > 0) {
                // Delete related data for these documents

                // 3a. Delete bookmarks on these documents (by any user)
                await tx.userBookmark.deleteMany({
                    where: { documentId: { in: documentIds } },
                });

                // 3b. Delete activity logs related to these documents
                await tx.activityLog.deleteMany({
                    where: { documentId: { in: documentIds } },
                });

                // 3c. Delete document authors
                await tx.documentAuthor.deleteMany({
                    where: { documentId: { in: documentIds } },
                });

                // 3d. Delete document keywords
                await tx.documentKeyword.deleteMany({
                    where: { documentId: { in: documentIds } },
                });

                // 3e. Finally delete the documents
                await tx.document.deleteMany({
                    where: { id: { in: documentIds } },
                });
            }

            // 4. Finally delete the user
            await tx.user.delete({
                where: { id },
            });
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: "Failed to delete user", details: error.message },
            { status: 500 }
        );
    }
}

/**
 * Edits the user
 * @param request - The incoming request
 * @param context - The context object containing the params includes user id
 */
export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idString } = await context.params;
        const id = parseInt(idString);
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const body = await request.json();
        const { name, email, role, status } = body;

        const roleId = await getRoleId(role);
        if (!roleId) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                username: name,
                email: email,
                currentRoleId: roleId,
                isVerified: status === "Accepted",
            },
            include: {
                role: true,
            },
        });

        return NextResponse.json({
            id: updatedUser.id.toString(),
            name: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role.roleName,
            status: updatedUser.isVerified ? "Accepted" : "Pending",
        });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        );
    }
}
