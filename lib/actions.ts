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
 */
export async function checkUserStatus(email: string) {
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
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
export async function verifyCredentials(email: string, password: string) {
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
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
    if (supabaseAuthId) {
        // Upsert using supabaseAuthId if provided
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
