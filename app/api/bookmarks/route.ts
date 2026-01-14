import { getAuthenticatedUserId } from '@/lib/auth/server'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/bookmarks
 * Fetches all bookmarks for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId()

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. Please sign in to view your bookmarks.',
        },
        { status: 401 },
      )
    }

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
          },
        },
      },
      orderBy: {
        dateBookmarked: 'desc',
      },
    })

    // Transform the data to a simpler format
    const formattedBookmarks = bookmarks.map((bookmark) => ({
      documentId: bookmark.documentId,
      dateBookmarked: bookmark.dateBookmarked.toISOString(),
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
        resourceType: bookmark.document.resourceType, // Now an enum, not a relation
        filePath: bookmark.document.filePath,
      },
    }))

    return NextResponse.json({
      success: true,
      bookmarks: formattedBookmarks,
      count: formattedBookmarks.length,
    })
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch bookmarks',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

/**
 * POST /api/bookmarks
 * Adds a bookmark for the current user
 *
 * Body: { documentId: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { documentId } = body

    // Convert string to number if needed (JSON can send numbers as strings)
    if (typeof documentId === 'string') {
      documentId = parseInt(documentId, 10)
    }

    // Validate documentId is a valid number
    if (!documentId || typeof documentId !== 'number' || isNaN(documentId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Document ID is required and must be a valid number',
        },
        { status: 400 },
      )
    }

    // Get authenticated user ID
    const userId = await getAuthenticatedUserId()

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. Please sign in to add bookmarks.',
        },
        { status: 401 },
      )
    }

    // Check if document exists
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    })

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message: 'Document not found',
        },
        { status: 404 },
      )
    }

    // Check if already bookmarked
    const existingBookmark = await prisma.userBookmark.findUnique({
      where: {
        userId_documentId: {
          userId: userId,
          documentId: documentId,
        },
      },
    })

    if (existingBookmark) {
      return NextResponse.json(
        {
          success: false,
          message: 'Document is already bookmarked',
        },
        { status: 409 },
      )
    }

    // Check bookmark limit based on user's tier
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptionTier: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 },
      )
    }

    const bookmarkCount = await prisma.userBookmark.count({
      where: { userId: userId },
    })

    // Check bookmark limit (null means unlimited)
    const maxBookmarks = user.subscriptionTier.maxBookmarks
    if (maxBookmarks !== null && bookmarkCount >= maxBookmarks) {
      return NextResponse.json(
        {
          success: false,
          message: `Bookmark limit reached. You can only save ${maxBookmarks} bookmarks with your current tier.`,
          maxBookmarks: maxBookmarks,
          currentCount: bookmarkCount,
        },
        { status: 403 },
      )
    }

    // Create the bookmark
    // dateBookmarked has a default value in the schema, so we don't need to provide it
    const bookmark = await prisma.userBookmark.create({
      data: {
        userId: userId,
        documentId: documentId,
        dateBookmarked: new Date(), // Explicitly set to avoid type issues
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Bookmark added successfully',
        bookmark: {
          documentId: bookmark.documentId,
          dateBookmarked: bookmark.dateBookmarked,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error adding bookmark:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to add bookmark',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
