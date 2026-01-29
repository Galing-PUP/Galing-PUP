import { prisma } from '@/lib/db'
import { DocStatus } from '@/lib/generated/prisma/enums'
import { NextRequest, NextResponse } from 'next/server'

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/documents/[id]
 * Public document fetcher with strict status guards.
 * Returns 410 if document is PENDING or DELETED.
 */
export async function GET(req: NextRequest, props: RouteParams) {
  try {
    const { id } = await props.params
    const documentId = Number(id)

    if (!Number.isInteger(documentId)) {
      return NextResponse.json(
        { error: 'Invalid document ID' },
        { status: 400 },
      )
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Part C: Document Status Guard
    if (
      document.status === DocStatus.PENDING ||
      document.status === DocStatus.DELETED
    ) {
      return new NextResponse(null, { status: 410, statusText: 'Gone' })
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error fetching document:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
