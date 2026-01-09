import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type SearchResult = {
  id: number;
  title: string;
  authors: string[];
  authorEmails: string[];
  additionalAuthors: number;
  field: string;
  date: string;
  abstract: string;
  pdfUrl?: string;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q")?.trim() ?? "";
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

  const where: any = {};

  if (q) {
    where.OR = [
      {
        keywords: {
          some: {
            keyword: {
              keywordText: { contains: q, mode: "insensitive" },
            },
          },
        },  
      }, 
    { title: { contains: q, mode: "insensitive" } },
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
    // documentType is already a ResourceTypes enum value from the frontend
    where.resourceType = documentType;
  }

  if (courseName !== "All Courses") {
    where.course = {
      courseName: { contains: courseName, mode: "insensitive" },
    };
  }

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

  const docs = await prisma.document.findMany({
    where,
    include: {
      authors: {
        include: {
          author: true,
        },
      },
      course: true, // to get field/department name
    },
    orderBy,
  });

  const results: SearchResult[] = docs.map((doc) => {
    const allAuthors = doc.authors.map((a) => a.author.fullName);
    const allAuthorEmails = doc.authors.map((a) => a.author.email);
    const authors = allAuthors.slice(0, 3);
    const authorEmails = allAuthorEmails.slice(0, 3);
    const additionalAuthors = Math.max(0, allAuthors.length - authors.length);

    return {
      id: doc.id,
      title: doc.title,
      authors,
      authorEmails,
      additionalAuthors,
      field: doc.course?.courseName ?? "Unknown",
      date: doc.datePublished
        ? new Date(doc.datePublished).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })
        : "Unknown",
      abstract: doc.abstract,
      pdfUrl: undefined, // or map from doc.filePath if you have a URL
    };
  });

  return NextResponse.json(results);
}