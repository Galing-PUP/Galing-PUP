import { prisma } from '@/lib/db'
import { DocStatus } from '@/lib/generated/prisma/enums'
import { NextRequest, NextResponse } from 'next/server'

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

/**
 * PATCH /api/admin/documents/[id]/status
 * Update document status (approve/reject)
 * Body: { status: "Pending" | "Accepted" | "Rejected" }
 */
export async function PATCH(req: NextRequest, props: RouteParams) {
  try {
    const { id } = await props.params
    const documentId = Number(id)

    if (!Number.isInteger(documentId)) {
      return NextResponse.json(
        { error: 'Invalid document ID' },
        { status: 400 },
      )
    }

    const body = await req.json()
    const { status } = body

    if (!status || !['Pending', 'Accepted', 'Rejected'].includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid status. Must be 'Pending', 'Accepted', or 'Rejected'",
        },
        { status: 400 },
      )
    }

    /**
     * Maps ContentItem status string to database DocStatus enum
     */
    const mapStatusToDb = (status: string): DocStatus => {
      switch (status) {
        case 'Accepted':
          return DocStatus.APPROVED
        case 'Rejected':
          return DocStatus.REJECTED
        case 'Pending':
        default:
          return DocStatus.PENDING
      }
    }

    const dbStatus = mapStatusToDb(status)

    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: dbStatus,
      },
      select: {
        id: true,
        status: true,
      },
    })

    return NextResponse.json({
      success: true,
      id: updatedDocument.id.toString(),
      status: status,
    })
  } catch (error: any) {
    console.error('Error updating document status:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Failed to update document status' },
      { status: 500 },
    )
  }
}
