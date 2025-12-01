import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type SearchResult = {
  id: number;
  title: string;
  authors: string[];
  additionalAuthors: number;
  field: string;
  date: string;
  abstract: string;
  pdfUrl?: string;
};

// Enable caching for GET requests (revalidate every 60 seconds for dynamic data)
export const revalidate = 60;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q")?.trim() ?? "";
    const campus = searchParams.get("campus") ?? "All Campuses";
    const courseName = searchParams.get("course") ?? "All Courses";
    const year = searchParams.get("year") ?? "All Years";
    const documentType = searchParams.get("documentType") ?? "All Types";
    const sort = searchParams.get("sort") as
      | "Newest to Oldest"
      | "Oldest to Newest"
      | "Most Relevant"
      | "Title A-Z"
      | "Title Z-A"
      | null;

    // Pagination parameters
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50", 10),
      100,
    ); // Max 100 results
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

    // Build where clause
    const where: any = {};

    if (q) {
      // Use Prisma's full-text search capabilities
      where.OR = [
        {
          title: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          abstract: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          keywords: {
            some: {
              keyword: {
                keywordText: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            },
          },
        },
      ];
    }

    if (year !== "All Years") {
      const yearNum = Number(year);
      if (!Number.isNaN(yearNum)) {
        const start = new Date(yearNum, 0, 1);
        const end = new Date(yearNum + 1, 0, 1);
        where.datePublished = { gte: start, lt: end };
      }
    }

    if (documentType !== "All Types") {
      let typeFilter = documentType;
      if (
        documentType === "Journal Article" ||
        documentType === "Conference Paper"
      ) {
        typeFilter = "Article";
      }

      where.resourceType = {
        typeName: { contains: typeFilter, mode: "insensitive" },
      };
    }

    if (courseName !== "All Courses") {
      where.course = {
        courseName: { contains: courseName, mode: "insensitive" },
      };
    }

    if (campus !== "All Campuses") {
      let keyword = campus;
      if (campus === "Main Campus") keyword = "Main";
      if (campus.startsWith("Branch")) keyword = "Branch";

      where.library = {
        name: { contains: keyword, mode: "insensitive" },
      };
    }

    // Build orderBy clause
    let orderBy: any = { datePublished: "desc" };
    switch (sort) {
      case "Oldest to Newest":
        orderBy = { datePublished: "asc" };
        break;
      case "Title A-Z":
        orderBy = { title: "asc" };
        break;
      case "Title Z-A":
        orderBy = { title: "desc" };
        break;
      case "Newest to Oldest":
      default:
        orderBy = { datePublished: "desc" };
    }

    // Optimized query: only select necessary fields for listing
    const [docs, totalCount] = await Promise.all([
      prisma.document.findMany({
        where,
        select: {
          id: true,
          title: true,
          abstract: true,
          datePublished: true,
          filePath: true,
          authors: {
            select: {
              author: {
                select: {
                  fullName: true,
                },
              },
            },
            orderBy: {
              authorOrder: "asc",
            },
            take: 3, // Only fetch first 3 authors for performance
          },
          course: {
            select: {
              courseName: true,
            },
          },
          _count: {
            select: {
              authors: true, // Get total count without fetching all
            },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      // Get total count for pagination (only when needed)
      offset === 0 ? prisma.document.count({ where }) : Promise.resolve(null),
    ]);

    // Transform results
    const results: SearchResult[] = docs.map((doc) => {
      const authors = doc.authors.map((a) => a.author.fullName);
      const totalAuthors = doc._count.authors;
      const additionalAuthors = Math.max(0, totalAuthors - authors.length);

      return {
        id: doc.id,
        title: doc.title,
        authors,
        additionalAuthors,
        field: doc.course?.courseName ?? "Unknown",
        date: new Date(doc.datePublished).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        abstract: doc.abstract,
        pdfUrl: undefined, // Map from doc.filePath if you have a URL pattern
      };
    });

    // Return results with pagination metadata
    return NextResponse.json(
      {
        results,
        pagination: {
          limit,
          offset,
          total: totalCount,
          hasMore: totalCount ? offset + limit < totalCount : undefined,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
