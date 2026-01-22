import { prisma } from '@/lib/db'
import { Prisma } from '@/lib/generated/prisma/client'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type AdminPublicationResult = {
  id: number
  title: string
  abstract: string
  field: string
  date: string
  author: string
  resourceType: string | null
  status: string
}

type AdminPublicationRow = {
  id: number
  title: string
  abstract: string
  date_published: Date | null
  resource_type: string | null
  status: string
  course_name: string | null
  author_name: string | null
  total_count: bigint | number
}

/**
 * Admin-only publications API with server-side pagination, filtering, and sorting.
 * Shows ALL publication statuses (not limited to APPROVED).
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication and admin role
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { supabaseAuthId: authUser.id },
      select: { role: true },
    })

    if (!user || !['ADMIN', 'SUPERADMIN', 'OWNER'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)

    const q = searchParams.get('q')?.trim() ?? ''
    const courseName = searchParams.get('course') ?? 'All Courses'
    const year = searchParams.get('year') ?? 'All Years'
    const documentType = searchParams.get('documentType') ?? 'All Types'
    const status = searchParams.get('status') ?? 'All Statuses'
    const limitParam = Number(searchParams.get('limit'))
    const pageParam = Number(searchParams.get('page'))
    const sort = searchParams.get('sort') as
      | 'Newest to Oldest'
      | 'Oldest to Newest'
      | 'Title A-Z'
      | 'Title Z-A'
      | null

    const DEFAULT_LIMIT = 20
    const MAX_LIMIT = 100
    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(Math.trunc(limitParam), MAX_LIMIT)
        : DEFAULT_LIMIT
    const offset =
      Number.isFinite(pageParam) && pageParam > 0
        ? (Math.trunc(pageParam) - 1) * limit
        : 0

    const filters: Prisma.Sql[] = []

    // Search by title, author, or field
    if (q) {
      filters.push(
        Prisma.sql`(
          d.title ILIKE ${`%${q}%`} OR
          c.course_name ILIKE ${`%${q}%`} OR
          a.full_name ILIKE ${`%${q}%`}
        )`,
      )
    }

    // Status filter
    if (status !== 'All Statuses') {
      filters.push(Prisma.sql`d.status = ${status}`)
    }

    // Year filter
    if (year !== 'All Years') {
      const startDate = new Date(Number(year), 0, 1)
      const endDate = new Date(Number(year), 11, 31)
      filters.push(
        Prisma.sql`d.date_published >= ${startDate} AND d.date_published <= ${endDate}`,
      )
    }

    // Document type filter
    if (documentType !== 'All Types') {
      filters.push(Prisma.sql`d.resource_type = ${documentType}`)
    }

    // Course filter
    if (courseName !== 'All Courses') {
      filters.push(Prisma.sql`c.course_name ILIKE ${`%${courseName}%`}`)
    }

    const orderByClause = (() => {
      switch (sort) {
        case 'Oldest to Newest':
          return Prisma.sql`d.date_published ASC NULLS LAST`
        case 'Title A-Z':
          return Prisma.sql`d.title ASC`
        case 'Title Z-A':
          return Prisma.sql`d.title DESC`
        case 'Newest to Oldest':
        default:
          return Prisma.sql`d.date_published DESC NULLS LAST`
      }
    })()

    const whereClause =
      filters.length > 0 ? Prisma.join(filters, ' AND ') : Prisma.sql`TRUE`

    const rows = await prisma.$queryRaw<AdminPublicationRow[]>`
      WITH primary_authors AS (
        SELECT DISTINCT ON (da.document_id)
          da.document_id,
          a.full_name AS author_name
        FROM document_authors da
        JOIN authors a ON a.author_id = da.author_id
        ORDER BY da.document_id, da.author_order ASC
      )
      SELECT
        d.document_id AS id,
        d.title,
        d.abstract,
        d.date_published,
        d.resource_type,
        d.status::text,
        c.course_name,
        COALESCE(pa.author_name, 'Unknown Author') AS author_name,
        COUNT(*) OVER() AS total_count
      FROM documents d
      JOIN courses c ON c.course_id = d.course_id
      LEFT JOIN primary_authors pa ON pa.document_id = d.document_id
      LEFT JOIN document_authors da ON da.document_id = d.document_id
      LEFT JOIN authors a ON a.author_id = da.author_id
      WHERE ${whereClause}
      GROUP BY d.document_id, c.course_name, pa.author_name
      ORDER BY ${orderByClause}
      LIMIT ${limit}
      OFFSET ${offset}
    `

    const results: AdminPublicationResult[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      abstract: row.abstract,
      field: row.course_name ?? 'Unknown',
      date: row.date_published
        ? new Date(row.date_published).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })
        : 'Unknown',
      author: row.author_name ?? 'Unknown Author',
      resourceType: row.resource_type,
      status: row.status,
    }))

    const total = Number(rows[0]?.total_count ?? 0)

    return NextResponse.json({ results, total })
  } catch (error) {
    console.error('Error fetching admin publications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch publications' },
      { status: 500 },
    )
  }
}
