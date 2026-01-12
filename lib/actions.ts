"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/db";
import { RoleName, UserStatus } from "@/lib/generated/prisma/enums";
import bcrypt from "bcryptjs";
import { getAuthenticatedUser } from "@/lib/auth/server";

/**
 * Fetches the currently authenticated user's profile, including their subscription tier.
 * @returns The user profile object or null if not authenticated.
 */
export async function getCurrentUser() {
    const user = await getAuthenticatedUser();

    if (!user) return null;

    // Fetch subscription tier separately since getAuthenticatedUser might not include it
    const userWithTier = await prisma.user.findUnique({
        where: { id: user.id },
        include: { subscriptionTier: true },
    });

    if (!userWithTier) return null;

    return {
        username: userWithTier.username,
        tierName: userWithTier.subscriptionTier.tierName,
        email: userWithTier.email,
        role: userWithTier.role,
    };
}

/**
 * Signs out the current user and redirects to the home page.
 */
export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
}

/**
 * Checks the status of a user by email.
 * Used for login validation.
 * @param email The email of the user to check.
 * @returns An object containing the user's status.
 */
/**
 * Checks the status of a user by email or username.
 * Used for login validation.
 * @param identifier The email or username of the user to check.
 * @returns An object containing the user's status.
 */
export async function checkUserStatus(identifier: string) {
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: identifier.toLowerCase() },
                { username: identifier },
            ],
        },
        select: {
            id: true,
            role: true,
            status: true,
            updatedDate: true,
            email: true,
        },
    });

    if (!user) {
        return { exists: false, isAdmin: false, isVerified: false, roleId: RoleName.REGISTERED, updatedDate: null, email: null };
    }

    // Admin roles are ADMIN, SUPERADMIN and OWNER
    const isAdmin = user.role === RoleName.ADMIN || user.role === RoleName.SUPERADMIN || user.role === RoleName.OWNER;

    return {
        exists: true,
        isAdmin,
        isVerified: user.status === UserStatus.APPROVED,
        roleId: user.role,
        updatedDate: user.updatedDate,
        email: user.email
    };
}

/**
 * Checks if a username is already taken.
 * Used for signup validation.
 */
export async function checkUsernameAvailability(username: string) {
    const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
    });

    return { exists: !!user };
}

/**
 * Verifies a user in the database.
 * Sets status to APPROVED and role to REGISTERED.
 */
/**
 * Creates a new user in the database with hashed password.
 */
export async function createUserInDb(email: string, username: string, supabaseAuthId: string, password?: string) {
    let passwordHash = null;
    if (password) {
        passwordHash = await bcrypt.hash(password, 10);
    }

    await prisma.user.create({
        data: {
            email: email.toLowerCase(),
            username,
            supabaseAuthId,
            passwordHash,
            registrationDate: new Date(),
            status: UserStatus.PENDING,
            role: RoleName.REGISTERED, // Default role
            tierId: 1, // Default tier
        },
    });
}

/**
 * Verifies user credentials by comparing password hash.
 */
/**
 * Verifies user credentials by comparing password hash.
 * Accepts either email or username.
 */
export async function verifyCredentials(identifier: string, password: string) {
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: identifier.toLowerCase() },
                { username: identifier },
            ],
        },
        select: { passwordHash: true },
    });

    if (!user || !user.passwordHash) {
        return false;
    }

    return await bcrypt.compare(password, user.passwordHash);
}

/**
 * Verifies a user in the database.
 * Sets status to APPROVED and role to REGISTERED.
 * If user doesn't exist, creates one (fallback).
 */
export async function verifyUserInDb(email: string, supabaseAuthId?: string) {
    const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });

    if (existingUser) {
        // User exists, just update verification status and link Auth ID if needed
        await prisma.user.update({
            where: { email: email.toLowerCase() },
            data: {
                status: UserStatus.APPROVED,
                role: RoleName.REGISTERED,
                ...(supabaseAuthId ? { supabaseAuthId } : {}),
            },
        });
    } else if (supabaseAuthId) {
        // User doesn't exist, create via upsert (safe create)
        const baseUsername = email.toLowerCase().split('@')[0];
        const username = `${baseUsername}_${crypto.randomUUID().slice(0, 8)}`;

        await prisma.user.upsert({
            where: { supabaseAuthId },
            update: {
                status: UserStatus.APPROVED,
                role: RoleName.REGISTERED,
            },
            create: {
                supabaseAuthId,
                email: email.toLowerCase(),
                username,
                registrationDate: new Date(),
                status: UserStatus.APPROVED,
                role: RoleName.REGISTERED,
                tierId: 1,
            },
        });
    } else {
        // Fallback to update by email if no auth ID (legacy behavior)
        await prisma.user.update({
            where: { email: email.toLowerCase() },
            data: {
                status: UserStatus.APPROVED,
                role: RoleName.REGISTERED,
            },
        });
    }
}
/**
 * Deletes a user from Supabase Auth and the database.
 * @param userId The Supabase Auth ID of the user to delete.
 */
export async function deleteUser(userId: string) {
    // 1. Delete from Supabase Auth (this is critical)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
        throw new Error(`Failed to delete user from Auth: ${authError.message}`);
    }

    // 2. Delete from Prisma (Database)
    // Note: Usually deleting from Auth cascades if configured, but explicit delete is safer
    // to ensure both are in sync if no cascade is set up.
    try {
        await prisma.user.delete({
            where: { supabaseAuthId: userId },
        });
    } catch (error) {
        // Ignored if already deleted or not found (e.g. cascade worked)
        console.warn("User might have already been deleted from DB or cascade is active:", error);
    }

    return { success: true };
}
