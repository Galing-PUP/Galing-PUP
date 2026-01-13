/**
 * API Route: Generate Citations
 * GET /api/citations/[id]
 * 
 * Generates academic citations for a document in multiple formats
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCitations } from '@/lib/services/citationService';
import type { CitationServiceResponse } from '@/types/citation';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * GET handler for citation generation
 * @param request - Next.js request object
 * @param context - Route context containing params
 * @returns JSON response with citations or error
 */
export async function GET(
  request: NextRequest,
  context: RouteParams
): Promise<NextResponse<CitationServiceResponse>> {
  try {
    const { id: idParam } = await context.params;
    const documentId = Number(idParam);

    // Validate document ID
    if (Number.isNaN(documentId) || documentId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid document ID. Must be a positive number.',
        },
        { status: 400 }
      );
    }

    // Generate citations
    const citations = await generateCitations(documentId);

    return NextResponse.json({
      success: true,
      data: citations,
    });
  } catch (error) {
    // Handle document not found
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Document not found.',
        },
        { status: 404 }
      );
    }

    // Handle other errors
    console.error('Citation generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate citations. Please try again later.',
      },
      { status: 500 }
    );
  }
}
