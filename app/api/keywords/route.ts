import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/keywords
 * Fetch all keywords from the database for tag suggestions
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    const where = query
      ? {
          keywordText: { contains: query, mode: 'insensitive' as const },
        }
      : {}

    const keywords = await prisma.keyword.findMany({
      where,
      select: {
        id: true,
        keywordText: true,
      },
      orderBy: {
        keywordText: 'asc',
      },
      take: 15,
    })

    return NextResponse.json(keywords)
  } catch (error) {
    console.error('Error fetching keywords:', error)
    return NextResponse.json(
      { error: 'Failed to fetch keywords' },
      { status: 500 },
    )
  }
}
