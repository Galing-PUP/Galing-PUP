import { NextResponse } from "next/server";
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

export async function GET() {
  const docs = await prisma.document.findMany({
    include: {
      authors: {
        include: {
          author: true,
        },
      },
      course: true, // to get field/department name
    },
    orderBy: {
      datePublished: "desc",
    },
  });

  const results: SearchResult[] = docs.map((doc) => {
    const allAuthors = doc.authors.map((a) => a.author.fullName);
    const authors = allAuthors.slice(0, 3);
    const additionalAuthors = Math.max(0, allAuthors.length - authors.length);

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
      pdfUrl: undefined, // or map from doc.filePath if you have a URL
    };
  });

  return NextResponse.json(results);
}