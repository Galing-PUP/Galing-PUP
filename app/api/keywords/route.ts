import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/keywords
 * Fetch all keywords from the database for tag suggestions
 */
export async function GET(request: NextRequest) {
  try {
    const keywords = await prisma.keyword.findMany({
      select: {
        id: true,
        keywordText: true,
      },
      orderBy: {
        keywordText: "asc",
      },
    });

    return NextResponse.json(keywords);
  } catch (error) {
    console.error("Error fetching keywords:", error);
    return NextResponse.json(
      { error: "Failed to fetch keywords" },
      { status: 500 }
    );
  }
}
