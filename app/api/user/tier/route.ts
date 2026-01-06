import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/auth/server";

/**
 * GET /api/user/tier
 * Fetches the subscription tier information for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId();
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please sign in to view your tier information.",
        },
        { status: 401 }
      );
    }

    // Fetch user with their subscription tier
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        subscriptionTier: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      maxBookmarks: user.subscriptionTier.maxBookmarks,
      tierName: user.subscriptionTier.tierName,
      dailyDownloadLimit: user.subscriptionTier.dailyDownloadLimit,
      dailyCitationLimit: user.subscriptionTier.dailyCitationLimit,
      hasAds: user.subscriptionTier.hasAds,
      hasAiInsights: user.subscriptionTier.hasAiInsights,
    });
  } catch (error) {
    console.error("Error fetching user tier:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user tier information",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
