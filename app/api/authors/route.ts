import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/authors
 * Fetch all authors from the database for author selection
 */
export async function GET(request: NextRequest) {
  try {
    const authors = await prisma.author.findMany({
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        fullName: true,
        email: true,
      },
      orderBy: {
        lastName: "asc",
      },
    });

    return NextResponse.json(authors);
  } catch (error) {
    console.error("Error fetching authors:", error);
    return NextResponse.json(
      { error: "Failed to fetch authors" },
      { status: 500 }
    );
  }
}
