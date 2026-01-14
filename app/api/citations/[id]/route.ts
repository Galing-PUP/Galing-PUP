/**
 * API Route: Generate Citations
 * GET /api/citations/[id]
 *
 * Generates academic citations for a document in multiple formats
 * Requires authentication and enforces daily citation limits
 */

import { getAuthenticatedUserId } from '@/lib/auth/server'
import {
  checkCitationLimit,
  generateCitations,
  logCitationActivity,
} from '@/lib/services/citationService'
import type { CitationServiceResponse } from '@/types/citation'
import { NextRequest, NextResponse } from 'next/server'

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

/**
 * GET handler for citation generation
 * @param request - Next.js request object
 * @param context - Route context containing params
 * @returns JSON response with citations or error
 */
export async function GET(
  request: NextRequest,
  context: RouteParams,
): Promise<NextResponse<CitationServiceResponse>> {
  try {
    // 1. Authentication Check
    const userId = await getAuthenticatedUserId()

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized. Please sign in to generate citations.',
        },
        { status: 401 },
      )
    }

    // 2. Validate document ID
    const { id: idParam } = await context.params
    const documentId = Number(idParam)

    if (Number.isNaN(documentId) || documentId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid document ID. Must be a positive number.',
        },
        { status: 400 },
      )
    }

    // 3. Rate Limiting Pre-Check
    try {
      await checkCitationLimit(userId, documentId)
    } catch (limitError) {
      // Handle limit reached error
      if (
        limitError instanceof Error &&
        limitError.message.includes('limit reached')
      ) {
        return NextResponse.json(
          {
            success: false,
            error: limitError.message,
          },
          { status: 429 }, // 429 Too Many Requests
        )
      }
      throw limitError // Re-throw if it's a different error
    }

    // 4. Generate Citations
    const { citations, citationCount, usage } = await generateCitations(
      documentId,
      userId,
    )

    // 5. Activity Logging (Post-Action)
    try {
      await logCitationActivity(userId, documentId)
    } catch (logError) {
      // Log the error but don't fail the request
      console.error('Failed to log citation activity:', logError)
    }

    // 6. Return Success Response
    return NextResponse.json({
      success: true,
      data: citations,
      citationCount: citationCount,
      usage: usage,
    })
  } catch (error) {
    // Handle document not found
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Document not found.',
        },
        { status: 404 },
      )
    }

    // Handle other errors
    console.error('Citation generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate citations. Please try again later.',
      },
      { status: 500 },
    )
  }
}
