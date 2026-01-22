import { prisma } from '@/lib/db'
import { Prisma } from '@/lib/generated/prisma/client'
import { encryptId } from '@/lib/obfuscation'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type SearchResult = {
  id: number
  title: string
  authors: string[]
  authorEmails: string[]
  additionalAuthors: number
  field: string
  date: string
  abstract: string
  resourceType: string | null
  pdfUrl?: string
  downloadToken?: string
}

type SearchRow = {
  id: number
  title: string
  abstract: string
  date_published: Date | null
  resource_type: string | null
  course_name: string | null
  authors: string[] | null
  author_emails: (string | null)[] | null
  rank: number
  total_count: bigint | number
}

/**
 * Handles browse search using PostgreSQL full-text search with relevance ranking
 * and structured filters for course, year range, and document type.
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication status
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    // Get user ID for token generation if authenticated
    let userId: number | undefined
    if (authUser) {
      const user = await prisma.user.findUnique({
        where: { supabaseAuthId: authUser.id },
        select: { id: true },
      })
      userId = user?.id
    }

    const { searchParams } = new URL(req.url)

    const q = searchParams.get('q')?.trim() ?? ''
    const courseName = searchParams.get('course') ?? 'All Courses'
    const yearRange = searchParams.get('yearRange') ?? 'Anytime'
    const documentType = searchParams.get('documentType') ?? 'All Types'
    const limitParam = Number(searchParams.get('limit'))
    const pageParam = Number(searchParams.get('page'))
    const offsetParam = Number(searchParams.get('offset'))
    const sort = searchParams.get('sort') as
      | 'Newest to Oldest'
      | 'Oldest to Newest'
      | 'Most Relevant'
      | 'Title A-Z'
      | 'Title Z-A'
      | null

    const DEFAULT_LIMIT = 20
    const MAX_LIMIT = 50
    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(Math.trunc(limitParam), MAX_LIMIT)
        : DEFAULT_LIMIT
    const offset = (() => {
      if (Number.isFinite(pageParam) && pageParam > 0) {
        return (Math.trunc(pageParam) - 1) * limit
      }
      if (Number.isFinite(offsetParam) && offsetParam >= 0) {
        return Math.trunc(offsetParam)
      }
      return 0
    })()

    const filters: Prisma.Sql[] = [Prisma.sql`d.status = 'APPROVED'`]

    if (yearRange !== 'Anytime') {
      const currentYear = new Date().getFullYear()
      let yearsBack = 0

      switch (yearRange) {
        case 'last3years':
          yearsBack = 3
          break
        case 'last5years':
          yearsBack = 5
          break
        case 'last10years':
          yearsBack = 10
          break
      }

      if (yearsBack > 0) {
        const startDate = new Date(currentYear - yearsBack + 1, 0, 1)
        filters.push(Prisma.sql`d.date_published >= ${startDate}`)
      }
    }

    if (documentType !== 'All Types') {
      filters.push(Prisma.sql`d.resource_type = ${documentType}`)
    }

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
          return Prisma.sql`d.date_published DESC NULLS LAST`
        default:
          if (q) {
            return Prisma.sql`rank DESC NULLS LAST, d.date_published DESC NULLS LAST`
          }
          return Prisma.sql`d.date_published DESC NULLS LAST`
      }
    })()

    let rows: SearchRow[] = []

    try {
      rows = await prisma.$queryRaw<SearchRow[]>`
        WITH search_query AS (
          SELECT ${q ? Prisma.sql`websearch_to_tsquery('english', ${q})` : Prisma.sql`NULL::tsquery`} AS query
        ),
        author_list AS (
          SELECT
            da.document_id,
            array_agg(a.full_name ORDER BY da.author_order) AS names,
            array_agg(a.email ORDER BY da.author_order) AS emails
          FROM document_authors da
          JOIN authors a ON a.author_id = da.author_id
          GROUP BY da.document_id
        )
        SELECT
          d.document_id AS id,
          d.title,
          d.abstract,
          d.date_published,
          d.resource_type,
          c.course_name,
          al.names AS authors,
          al.emails AS author_emails,
          ${q ? Prisma.sql`ts_rank(d.search_vector, sq.query)` : Prisma.sql`0`} AS rank,
          COUNT(*) OVER() AS total_count
        FROM documents d
        JOIN courses c ON c.course_id = d.course_id
        LEFT JOIN author_list al ON al.document_id = d.document_id
        CROSS JOIN search_query sq
        WHERE ${Prisma.join(filters, ' AND ')}
          AND ${q ? Prisma.sql`(sq.query IS NOT NULL AND d.search_vector @@ sq.query)` : Prisma.sql`TRUE`}
        ORDER BY ${orderByClause}
        LIMIT ${limit}
        OFFSET ${offset}
      `
    } catch (err) {
      console.error('FTS query failed, falling back to ORM search:', err)

      const where: Prisma.DocumentWhereInput = {
        status: 'APPROVED',
      }

      if (q) {
        where.OR = [
          {
            keywords: {
              some: {
                keyword: {
                  keywordText: { contains: q, mode: 'insensitive' },
                },
              },
            },
          },
          { title: { contains: q, mode: 'insensitive' } },
        ]
      }

      if (yearRange !== 'Anytime') {
        const currentYear = new Date().getFullYear()
        let yearsBack = 0

        switch (yearRange) {
          case 'last3years':
            yearsBack = 3
            break
          case 'last5years':
            yearsBack = 5
            break
          case 'last10years':
            yearsBack = 10
            break
        }

        if (yearsBack > 0) {
          const startDate = new Date(currentYear - yearsBack + 1, 0, 1)
          where.datePublished = { gte: startDate }
        }
      }

      if (documentType !== 'All Types') {
        where.resourceType = documentType as Prisma.EnumResourceTypesFilter
      }

      if (courseName !== 'All Courses') {
        where.course = {
          courseName: { contains: courseName, mode: 'insensitive' },
        }
      }

      const orderBy: Prisma.DocumentOrderByWithRelationInput = (() => {
        switch (sort) {
          case 'Oldest to Newest':
            return { datePublished: 'asc' }
          case 'Title A-Z':
            return { title: 'asc' }
          case 'Title Z-A':
            return { title: 'desc' }
          case 'Newest to Oldest':
            return { datePublished: 'desc' }
          default:
            return { datePublished: 'desc' }
        }
      })()

      const [docs, totalFallback] = await Promise.all([
        prisma.document.findMany({
          where,
          select: {
            id: true,
            title: true,
            abstract: true,
            datePublished: true,
            resourceType: true,
            authors: {
              select: {
                author: {
                  select: {
                    fullName: true,
                    email: true,
                  },
                },
              },
              orderBy: {
                authorOrder: 'asc',
              },
            },
            course: {
              select: {
                courseName: true,
              },
            },
          },
          orderBy,
          skip: offset,
          take: limit,
        }),
        prisma.document.count({ where }),
      ])

      rows = docs.map((doc) => ({
        id: doc.id,
        title: doc.title,
        abstract: doc.abstract,
        date_published: doc.datePublished,
        resource_type: doc.resourceType,
        course_name: doc.course?.courseName ?? null,
        authors: doc.authors.map((a) => a.author.fullName),
        author_emails: doc.authors.map((a) => a.author.email),
        rank: 0,
        total_count: totalFallback,
      }))
    }

    const results: SearchResult[] = rows.map((row) => {
      const authorList = row.authors ?? []
      const emailList = (row.author_emails ?? []).filter(
        (email): email is string => email !== null,
      )

      const authors = authorList.slice(0, 3)
      const authorEmails = emailList.slice(0, 3)
      const additionalAuthors = Math.max(0, authorList.length - authors.length)

      return {
        id: row.id,
        title: row.title,
        authors,
        authorEmails,
        additionalAuthors,
        field: row.course_name ?? 'Unknown',
        date: row.date_published
          ? new Date(row.date_published).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })
          : 'Unknown',
        abstract: row.abstract,
        resourceType: row.resource_type,
        pdfUrl: undefined,
        downloadToken: userId ? encryptId(row.id, userId) : undefined,
      }
    })

    const total = Number(rows[0]?.total_count ?? 0)

    return NextResponse.json({ results, total })
  } catch (error) {
    console.error('Error fetching browse results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 },
    )
  }
}
