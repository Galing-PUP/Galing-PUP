import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAuthenticatedUserId } from "@/lib/auth/server";
import { hash, compare } from "bcryptjs";

type PreferencesPayload = {
  username?: string;
  newPassword?: string;
};

/**
 * Check if a username is available.
 * 
 * @param request - The incoming GET request with username query parameter.
 * @returns JSON response indicating if the username is available.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username || username.trim().length === 0) {
      return NextResponse.json(
        { error: "Username parameter is required" },
        { status: 400 },
      );
    }

    const trimmedUsername = username.trim();

    // Check if username is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        username: trimmedUsername,
        id: { not: userId }, // Exclude current user
      },
      select: { id: true },
    });

    return NextResponse.json({
      available: !existingUser,
      username: trimmedUsername,
    });
  } catch (error) {
    console.error("Error checking username availability:", error);
    return NextResponse.json(
      { error: "Failed to check username availability" },
      { status: 500 },
    );
  }
}

/**
 * Update the authenticated user's own preferences.
 *
 * Allows a logged-in user to update their username and/or password.
 * This route resolves the current user from the Supabase session and then
 * applies updates in both Prisma (local database) and Supabase Auth.
 *
 * @param request - The incoming PATCH request containing JSON body.
 * @returns JSON response with the updated username or an error message.
 */
export async function PATCH(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as PreferencesPayload;
    const { username, newPassword } = body;

    if (!username && !newPassword) {
      return NextResponse.json(
        { error: "No changes provided" },
        { status: 400 },
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        supabaseAuthId: true,
        passwordHash: true, // Fetch current password hash for comparison
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    const updateData: {
      username?: string;
      passwordHash?: string;
      updatedDate: Date;
    } = {
      updatedDate: new Date(),
    };

    // Prepare Supabase Auth update payload
    const authUpdatePayload: {
      password?: string;
      user_metadata?: { username?: string };
    } = {};

    if (typeof username === "string" && username.trim().length > 0) {
      const trimmedUsername = username.trim();
      
      // Check if username is already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          username: trimmedUsername,
          id: { not: userId }, // Exclude current user
        },
        select: { id: true },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 409 },
        );
      }

      updateData.username = trimmedUsername;
      authUpdatePayload.user_metadata = { username: trimmedUsername };
    }

    if (typeof newPassword === "string" && newPassword.trim().length > 0) {
      // Check if new password is the same as current password
      if (dbUser.passwordHash) {
        const isSamePassword = await compare(newPassword, dbUser.passwordHash);
        if (isSamePassword) {
          return NextResponse.json(
            { error: "New password cannot be the same as your current password" },
            { status: 400 },
          );
        }
      }

      authUpdatePayload.password = newPassword;
      const passwordHash = await hash(newPassword, 10);
      updateData.passwordHash = passwordHash;
    }

    // Update Supabase Auth if we have an auth ID and something to update
    if (dbUser.supabaseAuthId && (authUpdatePayload.password || authUpdatePayload.user_metadata)) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        dbUser.supabaseAuthId,
        authUpdatePayload,
      );

      if (authError) {
        console.error("Failed to update Supabase Auth user:", authError);
        return NextResponse.json(
          { error: "Failed to update authentication profile" },
          { status: 500 },
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        username: true,
        email: true,
      },
    });

    return NextResponse.json({
      username: updatedUser.username,
      email: updatedUser.email,
    });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 },
    );
  }
}

