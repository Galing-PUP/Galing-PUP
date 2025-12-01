import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/user/tier
 * Fetches the subscription tier information for the current user
 *
 * TODO: Replace hardcoded userId with actual auth when implemented
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from auth session once auth is implemented
    // For now, using a temporary hardcoded userId
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ? parseInt(searchParams.get("userId")!) : 1;

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
