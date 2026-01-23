import { prisma } from '@/lib/db'
import { DocStatus } from '@/lib/generated/prisma/enums'
import { encryptId } from '@/lib/obfuscation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/admin/documents/[id]
 * Fetch a single document with its authors and keywords
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
      include: {
        authors: {
          include: {
            author: true,
          },
          orderBy: {
            authorOrder: 'asc',
          },
        },
        keywords: {
          include: {
            keyword: true,
          },
        },
        course: {
          include: {
            college: true,
          },
        },
      },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    /**
     * Maps database DocStatus enum to ContentItem status
     */
    const mapStatus = (status: any): 'Pending' | 'Accepted' | 'Rejected' => {
      switch (status) {
        case DocStatus.APPROVED:
          return 'Accepted'
        case DocStatus.REJECTED:
          return 'Rejected'
        case DocStatus.PENDING:
        default:
          return 'Pending'
      }
    }

    // 0. Get Admin User for Token Generation
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    let adminUserId: number | undefined = undefined
    if (authUser) {
      const adminUser = await prisma.user.findUnique({
        where: { supabaseAuthId: authUser.id },
        select: { id: true },
      })
      adminUserId = adminUser?.id
    }

    // Transform to match form structure
    const formattedDocument = {
      id: document.id,
      title: document.title,
      abstract: document.abstract,
      datePublished: document.datePublished?.toISOString().split('T')[0] || '',
      resourceType: document.resourceType,
      courseId: String(document.courseId),
      filePath: document.filePath,
      originalFileName: document.originalFileName,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      status: mapStatus(document.status),
      submissionDate:
        document.submissionDate?.toISOString().split('T')[0] || '',
      documentToken: encryptId(document.id, adminUserId),
      authors: document.authors.map((da: any) => ({
        firstName: da.author.firstName,
        middleName: da.author.middleName || '',
        lastName: da.author.lastName,
        email: da.author.email,
      })),
      keywords: document.keywords.map((dk: any) => dk.keyword.keywordText),
      course: document.course
        ? {
            courseName: document.course.courseName,
            college: document.course.college
              ? {
                  collegeName: document.course.college.collegeName,
                }
              : null,
          }
        : null,
    }

    return NextResponse.json(formattedDocument)
  } catch (error) {
    console.error('Error fetching document:', error)
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 },
    )
  }
}

/**
 * PUT /api/admin/documents/[id]
 * Update an existing document
 */
export async function PUT(req: NextRequest, props: RouteParams) {
  try {
    const { id } = await props.params
    const documentId = Number(id)

    if (!Number.isInteger(documentId)) {
      return NextResponse.json(
        { error: 'Invalid document ID' },
        { status: 400 },
      )
    }

    const formData = await req.formData()

    const title = formData.get('title') as string
    const abstract = formData.get('abstract') as string
    const keywords = formData.get('keywords') as string
    const datePublished = formData.get('datePublished') as string
    const resourceType = formData.get('resourceType') as string
    const authorsJson = formData.get('authors') as string
    const courseId = formData.get('courseId') as string
    const file = formData.get('file') as File | null

    // Parse authors
    const authors = JSON.parse(authorsJson)

    // 1. File Upload Logic (if new file provided)
    let filePath = undefined
    let originalFileName = undefined
    let fileSize = undefined
    let mimeType = undefined

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
      const filename = file.name.replace(/\.[^/.]+$/, '')
      const extension = file.name.split('.').pop()
      const uniqueFilename = `${filename}-${uniqueSuffix}.${extension}`

      const { data: uploadData, error: uploadError } =
        await supabaseAdmin.storage
          .from('PDF_UPLOADS')
          .upload(uniqueFilename, buffer, {
            contentType: file.type || 'application/pdf',
            upsert: false,
          })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error('Failed to upload file to storage')
      }

      filePath = uploadData.path
      originalFileName = file.name
      fileSize = file.size
      mimeType = file.type
    }

    // Fetch existing document to get old file path
    const existingDoc = await prisma.document.findUnique({
      where: { id: documentId },
      select: { filePath: true },
    })

    // 2. Transaction with increased timeout (keywords handled separately)
    const updatedDocument = await prisma.$transaction(
      async (tx) => {
        // Find old document to delete old file if needed
        // (This requires finding it before update, but we can do it after or assume)
        // Actually best practice: get it inside transaction or before.
        // We will skip deleting old file for now to keep it safe during transaction,
        // or we can query it first.

        // Update document
        const doc = await tx.document.update({
          where: { id: documentId },
          data: {
            title,
            abstract,
            datePublished: new Date(datePublished),
            resourceType: resourceType as any,
            courseId: parseInt(courseId),
            ...(filePath
              ? {
                  filePath,
                  originalFileName,
                  fileSize,
                  mimeType,
                }
              : {}),
          },
        })

        // Delete existing authors and keywords
        await tx.documentAuthor.deleteMany({
          where: { documentId },
        })
        await tx.documentKeyword.deleteMany({
          where: { documentId },
        })

        // Create or find authors and link them
        for (let i = 0; i < authors.length; i++) {
          const authorData = authors[i]

          // Find or create author by email + name combination
          let author = await tx.author.findFirst({
            where: {
              email: authorData.email,
              firstName: authorData.firstName,
              lastName: authorData.lastName,
            },
          })

          if (!author) {
            author = await tx.author.create({
              data: {
                firstName: authorData.firstName,
                middleName: authorData.middleName || null,
                lastName: authorData.lastName,
                fullName:
                  `${authorData.firstName} ${authorData.middleName || ''} ${authorData.lastName}`.trim(),
                email: authorData.email,
              },
            })
          }

          // Link author to document
          await tx.documentAuthor.create({
            data: {
              documentId: doc.id,
              authorId: author.id,
              authorOrder: i + 1,
            },
          })
        }

        return doc
      },
      { maxWait: 10000, timeout: 15000 }, // Increased timeout
    )

    // 3. Handle Keywords (OUTSIDE transaction to avoid timeout)
    const keywordArray = keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)
    for (const keywordText of keywordArray) {
      const keyword = await prisma.keyword.upsert({
        where: { keywordText },
        create: { keywordText },
        update: {},
      })

      await prisma.documentKeyword.create({
        data: {
          documentId: updatedDocument.id,
          keywordId: keyword.id,
        },
      })
    }

    // 4. Cleanup Old File (if replaced)
    if (
      filePath &&
      existingDoc?.filePath &&
      existingDoc.filePath !== filePath
    ) {
      const { error: removeError } = await supabaseAdmin.storage
        .from('PDF_UPLOADS')
        .remove([existingDoc.filePath])

      if (removeError) {
        console.error('Failed to remove old file from Supabase:', removeError)
      } else {
        console.log('Deleted old file from Supabase:', existingDoc.filePath)
      }
    }

    return NextResponse.json({
      success: true,
      document: updatedDocument,
    })
  } catch (error: any) {
    console.error('Error updating document:', error)
    if (
      (error.code === 'P2002' && error.meta?.target?.includes('title')) ||
      (error.message?.includes('Unique constraint failed') &&
        error.message?.includes('title'))
    ) {
      return NextResponse.json(
        { error: 'A document with this title already exists.' },
        { status: 409 },
      )
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to update document',
      },
      { status: 500 },
    )
  }
}

export async function DELETE(req: NextRequest, props: RouteParams) {
  try {
    const { id } = await props.params
    const documentId = Number(id)

    if (!Number.isInteger(documentId)) {
      return NextResponse.json(
        { error: 'Invalid document id' },
        { status: 400 },
      )
    }

    const existing = await prisma.document.findUnique({
      where: { id: documentId },
      select: { id: true, status: true, filePath: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const url = new URL(req.url)
    const permanent = url.searchParams.get('permanent') === 'true'

    if (permanent) {
      // Permanent delete
      await prisma.$transaction([
        prisma.documentKeyword.deleteMany({
          where: { documentId },
        }),
        prisma.documentAuthor.deleteMany({
          where: { documentId },
        }),
        prisma.userBookmark.deleteMany({
          where: { documentId },
        }),
        prisma.activityLog.deleteMany({
          where: { documentId },
        }),
        prisma.document.delete({
          where: { id: documentId },
        }),
      ])

      // Delete from Supabase Storage
      if (existing.filePath) {
        // remove returns {data, error} but we can just log error
        const { error } = await supabaseAdmin.storage
          .from('PDF_UPLOADS')
          .remove([existing.filePath])
        if (error) {
          console.error('Failed to remove file from Supabase:', error)
        } else {
          console.log('Deleted file from Supabase:', existing.filePath)
        }
      }

      return NextResponse.json({ success: true, permanent: true })
    } else {
      // Soft delete
      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: DocStatus.DELETED,
        },
      })

      return NextResponse.json({ success: true, permanent: false })
    }
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 },
    )
  }
}
