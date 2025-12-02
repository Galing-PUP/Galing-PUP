"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";


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
