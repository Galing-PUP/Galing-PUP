import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/bookmarks
 * Fetches all bookmarks for the current user
 *
 * TODO: Replace hardcoded userId with actual auth when implemented
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from auth session once auth is implemented
    // For now, using a temporary hardcoded userId
    // You can pass userId as a query param for testing: /api/bookmarks?userId=1
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ? parseInt(searchParams.get("userId")!) : 1;

    // Fetch all bookmarks for the user with document details
    const bookmarks = await prisma.userBookmark.findMany({
      where: {
        userId: userId,
      },
      include: {
        document: {
          include: {
            authors: {
              include: {
                author: true,
              },
              orderBy: {
                authorOrder: 'asc',
              },
            },
            course: {
              include: {
                college: true,
              },
            },
            resourceType: true,
          },
        },
      },
      orderBy: {
        dateBookmarked: 'desc',
      },
    });

    // Transform the data to a simpler format
    const formattedBookmarks = bookmarks.map((bookmark) => ({
      documentId: bookmark.documentId,
      dateBookmarked: bookmark.dateBookmarked,
      document: {
        id: bookmark.document.id,
        title: bookmark.document.title,
        abstract: bookmark.document.abstract,
        datePublished: bookmark.document.datePublished,
        downloadsCount: bookmark.document.downloadsCount,
        citationCount: bookmark.document.citationCount,
        authors: bookmark.document.authors.map((da) => da.author.fullName),
        course: bookmark.document.course.courseName,
        college: bookmark.document.course.college.collegeName,
        resourceType: bookmark.document.resourceType.typeName,
        filePath: bookmark.document.filePath,
      },
    }));

    return NextResponse.json({
      success: true,
      bookmarks: formattedBookmarks,
      count: formattedBookmarks.length,
    });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch bookmarks",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bookmarks
 * Adds a bookmark for the current user
 *
 * Body: { documentId: number }
 * TODO: Replace hardcoded userId with actual auth when implemented
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId } = body;

    if (!documentId || typeof documentId !== "number") {
      return NextResponse.json(
        {
          success: false,
          message: "Document ID is required and must be a number",
        },
        { status: 400 }
      );
    }

    // TODO: Get userId from auth session once auth is implemented
    // For now, using a temporary hardcoded userId
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ? parseInt(searchParams.get("userId")!) : 1;

    // Check if document exists
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message: "Document not found",
        },
        { status: 404 }
      );
    }

    // Check if already bookmarked
    const existingBookmark = await prisma.userBookmark.findUnique({
      where: {
        userId_documentId: {
          userId: userId,
          documentId: documentId,
        },
      },
    });

    if (existingBookmark) {
      return NextResponse.json(
        {
          success: false,
          message: "Document is already bookmarked",
        },
        { status: 409 }
      );
    }

    // Check bookmark limit based on user's tier
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    const bookmarkCount = await prisma.userBookmark.count({
      where: { userId: userId },
    });

    if (bookmarkCount >= user.subscriptionTier.maxBookmarks) {
      return NextResponse.json(
        {
          success: false,
          message: `Bookmark limit reached. You can only save ${user.subscriptionTier.maxBookmarks} bookmarks with your current tier.`,
          maxBookmarks: user.subscriptionTier.maxBookmarks,
          currentCount: bookmarkCount,
        },
        { status: 403 }
      );
    }

    // Create the bookmark
    const bookmark = await prisma.userBookmark.create({
      data: {
        userId: userId,
        documentId: documentId,
        dateBookmarked: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Bookmark added successfully",
        bookmark: {
          documentId: bookmark.documentId,
          dateBookmarked: bookmark.dateBookmarked,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding bookmark:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add bookmark",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
