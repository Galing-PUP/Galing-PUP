import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { ResourceTypes } from "@/lib/generated/prisma/enums";

async function ensureUploadsDir() {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  return uploadDir;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const title = String(formData.get("title") ?? "").trim();
    const abstract = String(formData.get("abstract") ?? "").trim();
    const datePublishedStr = String(formData.get("datePublished") ?? "").trim();
    const resourceTypeRaw = String(formData.get("resourceType") ?? "").trim();
    // const visibilityRaw = String(formData.get("visibility") ?? "").trim(); // Removed in schema? Default to public/enum? Schema says 'visibility' field exists in Document?
    // Checking schema: `visibility` is NOT in the provided schema snippet for Document. 
    // Wait, schema has `status DocStatus`. It does NOT have `visibility`.
    // The previous code had `visibility`. I should check if I missed it in schema view.
    // Looking at schema artifact: No `visibility` field in `Document` model. 
    // It has `status` and `resourceType`. 
    // I will assume `visibility` is removed or I should ignore it.

    const courseIdStr = String(formData.get("courseId") ?? "").trim();
    const file = formData.get("file") as File | null;
    
    // Parse JSON fields
    const authorsJson = String(formData.get("authors") ?? "[]");
    let authors: any[] = [];
    try {
      authors = JSON.parse(authorsJson);
    } catch (e) {
      return NextResponse.json({ error: "Invalid authors format" }, { status: 400 });
    }

    const keywordsRaw = String(formData.get("keywords") ?? "");
    // Frontend sends "tag1, tag2". We need array.
    // Wait, did I update frontend to send JSON? No, I updated frontend to send `formData.keywords.join(", ")`.
    // So splitting by comma is correct.
    const keywords = keywordsRaw.split(",").map(k => k.trim()).filter(Boolean);

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

    // Handle File Upload First
    const uploadDir = await ensureUploadsDir();
    const fileExt = path.extname(file.name) || ".pdf";
    const fileBaseName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    const fileName = `${fileBaseName}${fileExt}`;
    const filePathOnDisk = path.join(uploadDir, fileName);
    const publicFilePath = `/uploads/${fileName}`;

    const fileBytes = await file.arrayBuffer();
    await writeFile(filePathOnDisk, Buffer.from(fileBytes));

    // DB Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get Uploader (Placeholder logic)
      const uploader = await tx.user.findFirst();
      if (!uploader) throw new Error("No uploader user found");

      // 2. Resource Type Validation
      // Ensure the string matches the Enum
      if (!Object.values(ResourceTypes).includes(resourceTypeRaw as ResourceTypes)) {
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
          status: "PENDING", // Default
          // libraryId removed
        },
      });

      // 4. Handle Authors (Async Upsert/Connect)
      for (let i = 0; i < authors.length; i++) {
        const authorData = authors[i];
        let authorId = authorData.id;

        // Check if this is a "temp" ID (large number) or missing
        // Real database IDs are unlikely to match Date.now() (trillions)
        const isTempId = !authorId || authorId > 2147483647; // Max 32-bit int

        if (isTempId) {
            // Create new author
            const newAuthor = await tx.author.create({
                data: {
                    firstName: authorData.firstName,
                    middleName: authorData.middleName,
                    lastName: authorData.lastName,
                    fullName: `${authorData.firstName} ${authorData.middleName || ""} ${authorData.lastName}`.trim(),
                    email: authorData.email || null,
                }
            });
            authorId = newAuthor.id;
        } 
        // Else use existing authorId

        // Create Relation
        await tx.documentAuthor.create({
            data: {
                documentId: document.id,
                authorId: authorId,
                authorOrder: i + 1,
            }
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
              }
          });
      }

      return document;
    });

    return NextResponse.json(
      { id: result.id, filePath: publicFilePath },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create document" },
      { status: 500 }
    );
  }
}

