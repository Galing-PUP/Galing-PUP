import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * GET /api/admin/documents/[id]
 * Fetch a single document with its authors and keywords
 */
export async function GET(req: NextRequest, props: RouteParams) {
  try {
    const { id } = await props.params;
    const documentId = Number(id);

    if (!Number.isInteger(documentId)) {
      return NextResponse.json(
        { error: "Invalid document ID" },
        { status: 400 }
      );
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        authors: {
          include: {
            author: true,
          },
          orderBy: {
            authorOrder: "asc",
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
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Transform to match form structure
    const formattedDocument = {
      id: document.id,
      title: document.title,
      abstract: document.abstract,
      datePublished: document.datePublished?.toISOString().split("T")[0] || "",
      resourceType: document.resourceType,
      courseId: String(document.courseId),
      filePath: document.filePath,
      authors: document.authors.map((da: any) => ({
        firstName: da.author.firstName,
        middleName: da.author.middleName || "",
        lastName: da.author.lastName,
        email: da.author.email,
      })),
      keywords: document.keywords.map((dk: any) => dk.keyword.keywordText),
    };

    return NextResponse.json(formattedDocument);
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/documents/[id]
 * Update an existing document
 */
export async function PUT(req: NextRequest, props: RouteParams) {
  try {
    const { id } = await props.params;
    const documentId = Number(id);

    if (!Number.isInteger(documentId)) {
      return NextResponse.json(
        { error: "Invalid document ID" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    
    const title = formData.get("title") as string;
    const abstract = formData.get("abstract") as string;
    const keywords = formData.get("keywords") as string;
    const datePublished = formData.get("datePublished") as string;
    const resourceType = formData.get("resourceType") as string;
    const authorsJson = formData.get("authors") as string;
    const courseId = formData.get("courseId") as string;
    const file = formData.get("file") as File | null;

    // Parse authors
    const authors = JSON.parse(authorsJson);

    // TODO: Handle file upload if new file provided
    // NOTE: Using local file storage for testing. Migrate to cloud storage (S3/R2) for production.
    let filePath = undefined;
    if (file) {
      // File upload logic will be implemented here
      // For now, we'll keep the existing file path
    }

    // Update document in transaction
    const updatedDocument = await prisma.$transaction(async (tx) => {
      // Update document
      const doc = await tx.document.update({
        where: { id: documentId },
        data: {
          title,
          abstract,
          datePublished: new Date(datePublished),
          resourceType: resourceType as any,
          courseId: parseInt(courseId),
          ...(filePath ? { filePath } : {}),
        },
      });

      // Delete existing authors and keywords
      await tx.documentAuthor.deleteMany({
        where: { documentId },
      });
      await tx.documentKeyword.deleteMany({
        where: { documentId },
      });

      // Create or find authors and link them
      for (let i = 0; i < authors.length; i++) {
        const authorData = authors[i];
        
        // Find or create author by email + name combination
        let author = await tx.author.findFirst({
          where: {
            email: authorData.email,
            firstName: authorData.firstName,
            lastName: authorData.lastName,
          },
        });

        if (!author) {
          author = await tx.author.create({
            data: {
              firstName: authorData.firstName,
              middleName: authorData.middleName || null,
              lastName: authorData.lastName,
              fullName: `${authorData.firstName} ${authorData.middleName || ""} ${authorData.lastName}`.trim(),
              email: authorData.email,
            },
          });
        }

        // Link author to document
        await tx.documentAuthor.create({
          data: {
            documentId: doc.id,
            authorId: author.id,
            authorOrder: i + 1,
          },
        });
      }

      // Create or find keywords and link them
      const keywordArray = keywords.split(",").map((k) => k.trim()).filter(Boolean);
      for (const keywordText of keywordArray) {
        const keyword = await tx.keyword.upsert({
          where: { keywordText },
          create: { keywordText },
          update: {},
        });

        await tx.documentKeyword.create({
          data: {
            documentId: doc.id,
            keywordId: keyword.id,
          },
        });
      }

      return doc;
    });

    return NextResponse.json({
      success: true,
      document: updatedDocument,
    });
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, props: RouteParams) {
  try {
    const { id } = await props.params;
    const documentId = Number(id);

    if (!Number.isInteger(documentId)) {
      return NextResponse.json(
        { error: "Invalid document id" },
        { status: 400 }
      );
    }

    const existing = await prisma.document.findUnique({
      where: { id: documentId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

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
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}


