import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hash } from "bcryptjs";

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
            fullname: user.fullname || "",
            email: user.email,
            // fallbacks to user if the user has no role
            role: user.role?.roleName || "User",
            status: user.isVerified ? "Accepted" : "Pending",
            subscriptionTier: user.tierId,
            collegeId: user.collegeId || undefined,
            uploadId: user.uploadId || undefined,
            registrationDate: user.registrationDate.toISOString().split('T')[0], // format as YYYY-MM-DD
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

/**
 * Creates a new user
 * @param request 
 * @returns 
 */
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const role = formData.get("role") as string;
        const status = formData.get("status") as string;
        const subscriptionTier = formData.get("subscriptionTier");
        const password = formData.get("password") as string;
        const fullname = formData.get("fullname") as string;
        const collegeId = formData.get("collegeId") ? parseInt(formData.get("collegeId") as string) : undefined;
        const file = formData.get("idImage") as File | null;

        // 1. Basic Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // 2. Check for duplicates in Prisma
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: name },
                    { email: email },
                ],
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Username or Email already exists", type: "DUPLICATE_ENTRY" },
                { status: 409 }
            );
        }

        // 3. Resolve Role ID
        const roleRecord = await prisma.role.findFirst({
            where: { roleName: role },
        });
        const roleId = roleRecord?.id || 1; // Default to Viewer/Registered if not found

        // 4. Create in Supabase Auth
        // We use admin API to create user without sending confirmation email immediately if verified
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: status === "Accepted", // Auto-confirm if status is Accepted
            user_metadata: { username: name }
        });

        if (authError) {
            console.error("Supabase Auth create error:", authError);
            return NextResponse.json(
                { error: authError.message || "Failed to create user in authentication system" },
                { status: 500 } // Or 400 depending on error
            );
        }

        if (!authData.user) {
            return NextResponse.json(
                { error: "Failed to create user in authentication system (No user returned)" },
                { status: 500 }
            );
        }

        // 5. Handle File Upload if present
        let uploadId = undefined;
        if (file && file.size > 0) {
            const ID_UPLOAD_BUCKET = 'ID_UPLOAD';
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${name.replace(/\s+/g, '_')}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
                .from(ID_UPLOAD_BUCKET)
                .upload(fileName, file, {
                    contentType: file.type,
                    upsert: false
                });

            if (uploadError) {
                console.error("Supabase Upload Error:", uploadError);
                // We proceed without the image if upload fails, but log it.
            } else {
                uploadId = uploadData.path;
            }
        }

        // 6. Create in Prisma DB
        const passwordHash = await hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username: name,
                fullname: fullname || "",
                email: email,
                passwordHash: passwordHash,
                supabaseAuthId: authData.user.id,
                currentRoleId: roleId,
                tierId: subscriptionTier ? parseInt(subscriptionTier as string) : 1,
                collegeId: collegeId,
                uploadId: uploadId,
                registrationDate: new Date(),
                isVerified: status === "Accepted",
            },
            include: {
                role: true,
            },
        });

        // 7. Return formatted response
        return NextResponse.json({
            id: newUser.id.toString(),
            name: newUser.username,
            email: newUser.email,
            role: newUser.role.roleName,
            status: newUser.isVerified ? "Accepted" : "Pending",
            subscriptionTier: newUser.tierId,
            registrationDate: newUser.registrationDate.toISOString().split('T')[0],
        }, { status: 201 });

    } catch (error: any) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: "Failed to create user", details: error.message },
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
