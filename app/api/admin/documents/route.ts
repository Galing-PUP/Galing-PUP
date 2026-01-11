import { prisma } from "@/lib/db";
import { ResourceTypes } from "@/lib/generated/prisma/enums";
import { mkdir, writeFile, unlink } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

async function ensureUploadsDir() {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  return uploadDir;
}

export async function POST(req: NextRequest) {
  let filePathOnDisk: string | undefined;

  try {
    const formData = await req.formData();

    const title = String(formData.get("title") ?? "").trim();
    const abstract = String(formData.get("abstract") ?? "").trim();
    const datePublishedStr = String(formData.get("datePublished") ?? "").trim();
    const resourceTypeRaw = String(formData.get("resourceType") ?? "").trim();
    const courseIdStr = String(formData.get("courseId") ?? "").trim();
    const file = formData.get("file") as File | null;

    // Parse JSON fields
    const authorsJson = String(formData.get("authors") ?? "[]");
    let authors: any[] = [];
    try {
      authors = JSON.parse(authorsJson);
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid authors format" },
        { status: 400 }
      );
    }

    const keywordsRaw = String(formData.get("keywords") ?? "");
    const keywords = keywordsRaw
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    if (
      !title ||
      !abstract ||
      !datePublishedStr ||
      !resourceTypeRaw ||
      !file ||
      !courseIdStr
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const datePublished = new Date(datePublishedStr);
    if (Number.isNaN(datePublished.getTime())) {
      return NextResponse.json(
        { error: "Invalid publication date" },
        { status: 400 }
      );
    }

    const courseId = Number(courseIdStr);
    if (!Number.isInteger(courseId)) {
      return NextResponse.json(
        { error: "Invalid course selected" },
        { status: 400 }
      );
    }

    // Pre-check for duplicate title to avoid saving file unnecessarily
    const existingDoc = await prisma.document.findUnique({
      where: { title },
      select: { id: true },
    });

    if (existingDoc) {
      return NextResponse.json(
        { error: "A document with this title already exists." },
        { status: 409 }
      );
    }

    // Handle File Upload
    const uploadDir = await ensureUploadsDir();
    const fileExt = path.extname(file.name) || ".pdf";
    const fileBaseName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    const fileName = `${fileBaseName}${fileExt}`;
    filePathOnDisk = path.join(uploadDir, fileName); // Set scope var
    const publicFilePath = `/uploads/${fileName}`;

    const fileBytes = await file.arrayBuffer();
    await writeFile(filePathOnDisk, Buffer.from(fileBytes));

    // DB Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get Uploader (Placeholder logic)
      // TODO: Replace with getting the current admin or super admin user
      const uploader = await tx.user.findFirst();
      if (!uploader) throw new Error("No uploader user found");

      // 2. Resource Type Validation
      // Ensure the string matches the Enum
      if (
        !Object.values(ResourceTypes).includes(resourceTypeRaw as ResourceTypes)
      ) {
        throw new Error("Invalid resource type");
      }

      // 3. Create Document
      const document = await tx.document.create({
        data: {
          title,
          abstract,
          filePath: publicFilePath,
          datePublished,
          resourceType: resourceTypeRaw as ResourceTypes,
          uploaderId: uploader.id,
          courseId,
          
          // File Metadata
          originalFileName: file.name,
          fileSize: file.size,
          mimeType: file.type,

          status: "PENDING", // All new documents are PENDING
          submissionDate: new Date(),
        },
      });

      // 4. Handle Authors (Async Upsert/Connect)
      for (let i = 0; i < authors.length; i++) {
        const authorData = authors[i];
        let authorId = authorData.id;

        // Check if this is a "temp" ID (large number) or missing
        const isTempId = !authorId || authorId > 2147483647;

        if (isTempId) {
          // Create new author
          const newAuthor = await tx.author.create({
            data: {
              firstName: authorData.firstName,
              middleName: authorData.middleName,
              lastName: authorData.lastName,
              fullName: `${authorData.firstName} ${
                authorData.middleName || ""
              } ${authorData.lastName}`.trim(),
              email: authorData.email || null,
            },
          });
          authorId = newAuthor.id;
        }
        // Else use existing authorId
        await tx.documentAuthor.create({
          data: {
            documentId: document.id,
            authorId: authorId,
            authorOrder: i + 1,
          },
        });
      }

      // 5. Handle Keywords (Async Upsert)
      for (const keywordText of keywords) {
        const keyword = await tx.keyword.upsert({
          where: { keywordText },
          update: {},
          create: { keywordText },
        });

        await tx.documentKeyword.create({
          data: {
            documentId: document.id,
            keywordId: keyword.id,
          },
        });
      }

      return document;
    });

    return NextResponse.json(
      { id: result.id, filePath: publicFilePath },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating document:", error);

    // Cleanup file if it was created but operation failed
    if (filePathOnDisk) {
      try {
        await unlink(filePathOnDisk);
        console.log("Cleaned up orphaned file:", filePathOnDisk);
      } catch (cleanupError) {
        console.error("Failed to cleanup file:", cleanupError);
      }
    }

    if (
      (error.code === "P2002" && error.meta?.target?.includes("title")) ||
      (error.message?.includes("Unique constraint failed") &&
        error.message?.includes("title"))
    ) {
        return NextResponse.json(
            { error: "A document with this title already exists." },
            { status: 409 }
        );
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create document",
      },
      { status: 500 }
    );
  }
}
