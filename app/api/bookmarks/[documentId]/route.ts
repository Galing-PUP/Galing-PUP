import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * DELETE /api/bookmarks/[documentId]
 * Removes a bookmark for the current user
 *
 * TODO: Replace hardcoded userId with actual auth when implemented
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  try {
    const { documentId: documentIdParam } = await params;
    const documentId = parseInt(documentIdParam);

    if (isNaN(documentId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid document ID",
        },
        { status: 400 },
      );
    }

    // TODO: Get userId from auth session once auth is implemented
    // For now, using a temporary hardcoded userId
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId")
      ? parseInt(searchParams.get("userId")!)
      : 1;

    // Check if bookmark exists
    const existingBookmark = await prisma.userBookmark.findUnique({
      where: {
        userId_documentId: {
          userId: userId,
          documentId: documentId,
        },
      },
    });

    if (!existingBookmark) {
      return NextResponse.json(
        {
          success: false,
          message: "Bookmark not found",
        },
        { status: 404 },
      );
    }

    // Delete the bookmark
    await prisma.userBookmark.delete({
      where: {
        userId_documentId: {
          userId: userId,
          documentId: documentId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Bookmark removed successfully",
      documentId: documentId,
    });
  } catch (error) {
    console.error("Error removing bookmark:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove bookmark",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/bookmarks/[documentId]
 * Checks if a document is bookmarked by the current user
 *
 * TODO: Replace hardcoded userId with actual auth when implemented
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  try {
    const { documentId: documentIdParam } = await params;
    const documentId = parseInt(documentIdParam);

    if (isNaN(documentId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid document ID",
        },
        { status: 400 },
      );
    }

    // TODO: Get userId from auth session once auth is implemented
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId")
      ? parseInt(searchParams.get("userId")!)
      : 1;

    const bookmark = await prisma.userBookmark.findUnique({
      where: {
        userId_documentId: {
          userId: userId,
          documentId: documentId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      isBookmarked: !!bookmark,
      dateBookmarked: bookmark?.dateBookmarked || null,
    });
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to check bookmark status",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
