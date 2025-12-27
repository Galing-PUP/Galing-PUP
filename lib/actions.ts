"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";


/**
 * Fetches the currently authenticated user's profile, including their subscription tier.
 * @returns The user profile object or null if not authenticated.
 */
export async function getCurrentUser() {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) return null;

    const user = await prisma.user.findUnique({
        where: { supabaseAuthId: authUser.id },
        include: { subscriptionTier: true },
    });

    if (!user) return null;

    return {
        username: user.username,
        tierName: user.subscriptionTier.tierName,
        email: user.email,
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
            currentRoleId: true,
            isVerified: true,
        },
    });

    if (!user) {
        return { exists: false, isAdmin: false, isVerified: false };
    }

    // Admin roles are 3 and 4
    const isAdmin = [3, 4].includes(user.currentRoleId);

    return {
        exists: true,
        isAdmin,
        isVerified: user.isVerified,
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
 * Sets isVerified to true and currentRoleId to 2.
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
            isVerified: false,
            currentRoleId: 1, // Default role
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
 * Sets isVerified to true and currentRoleId to 2.
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
                isVerified: true,
                currentRoleId: 2,
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
                isVerified: true,
                currentRoleId: 2,
            },
            create: {
                supabaseAuthId,
                email: email.toLowerCase(),
                username,
                registrationDate: new Date(),
                isVerified: true,
                currentRoleId: 2,
                tierId: 1,
            },
        });
    } else {
        // Fallback to update by email if no auth ID (legacy behavior)
        await prisma.user.update({
            where: { email: email.toLowerCase() },
            data: {
                isVerified: true,
                currentRoleId: 2,
            },
        });
    }
}
