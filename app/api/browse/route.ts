import { prisma } from '@/lib/db'
import { Prisma } from '@/lib/generated/prisma/client'
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
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const q = searchParams.get('q')?.trim() ?? ''
    const courseName = searchParams.get('course') ?? 'All Courses'
    const yearRange = searchParams.get('yearRange') ?? 'Anytime'
    const documentType = searchParams.get('documentType') ?? 'All Types'
    const sort = searchParams.get('sort') as
      | 'Newest to Oldest'
      | 'Oldest to Newest'
      | 'Most Relevant'
      | 'Title A-Z'
      | 'Title Z-A'
      | null

    // Build where clause with proper typing
    const where: Prisma.DocumentWhereInput = {
      status: 'APPROVED', // Only show approved documents
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

    // Handle year range filtering
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

    // Build orderBy clause with proper typing
    let orderBy: Prisma.DocumentOrderByWithRelationInput = {
      datePublished: 'desc',
    }

    switch (sort) {
      case 'Oldest to Newest':
        orderBy = { datePublished: 'asc' }
        break
      case 'Title A-Z':
        orderBy = { title: 'asc' }
        break
      case 'Title Z-A':
        orderBy = { title: 'desc' }
        break
      case 'Newest to Oldest':
        orderBy = { datePublished: 'desc' }
        break
    }

    // Optimized query using select instead of include
    const docs = await prisma.document.findMany({
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
    })

    const results: SearchResult[] = docs.map((doc) => {
      const allAuthors = doc.authors.map((a) => a.author.fullName)
      const allAuthorEmails = doc.authors
        .map((a) => a.author.email)
        .filter((email): email is string => email !== null)

      const authors = allAuthors.slice(0, 3)
      const authorEmails = allAuthorEmails.slice(0, 3)
      const additionalAuthors = Math.max(0, allAuthors.length - authors.length)

      return {
        id: doc.id,
        title: doc.title,
        authors,
        authorEmails,
        additionalAuthors,
        field: doc.course?.courseName ?? 'Unknown',
        date: doc.datePublished
          ? new Date(doc.datePublished).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })
          : 'Unknown',
        abstract: doc.abstract,
        resourceType: doc.resourceType ?? null,
        pdfUrl: undefined,
      }
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error fetching browse results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 },
    )
  }
}
