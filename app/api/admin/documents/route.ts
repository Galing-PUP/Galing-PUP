import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

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
    const keywordsRaw = String(formData.get("keywords") ?? "").trim();
    const datePublishedStr = String(formData.get("datePublished") ?? "").trim();
    const resourceTypeRaw = String(formData.get("resourceType") ?? "").trim();
    const visibilityRaw = String(formData.get("visibility") ?? "").trim();
    const authorsRaw = String(formData.get("authors") ?? "").trim();
    const courseIdStr = String(formData.get("courseId") ?? "").trim();
    const libraryName = String(formData.get("library") ?? "").trim();
    const file = formData.get("file") as File | null;

    if (
      !title ||
      !abstract ||
      !datePublishedStr ||
      !resourceTypeRaw ||
      !libraryName ||
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

    const visibility =
      visibilityRaw.toLowerCase() === "restricted" ? "Restricted" : "Public";

    const courseId = Number(courseIdStr);
    if (!Number.isInteger(courseId)) {
      return NextResponse.json(
        { error: "Invalid course selected" },
        { status: 400 }
      );
    }

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

    const uploader = await prisma.user.findFirst();
    if (!uploader) {
      return NextResponse.json(
        { error: "No uploader user found in database" },
        { status: 500 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Selected course does not exist" },
        { status: 400 }
      );
    }

    let library = await prisma.library.findFirst({
      where: { name: libraryName },
    });

    if (!library) {
      library = await prisma.library.create({
        data: {
          name: libraryName,
        },
      });
    }

    let resourceType = await prisma.resourceType.findFirst({
      where: {
        typeName: {
          contains: resourceTypeRaw,
          mode: "insensitive",
        },
      },
    });

    if (!resourceType) {
      resourceType = await prisma.resourceType.create({
        data: {
          typeName: resourceTypeRaw,
        },
      });
    }

    const document = await prisma.document.create({
      data: {
        title,
        abstract,
        filePath: publicFilePath,
        datePublished,
        visibility,
        uploaderId: uploader.id,
        courseId: course.id,
        resourceTypeId: resourceType.id,
        libraryId: library.id,
      },
    });

    const authorNames = authorsRaw
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    for (let index = 0; index < authorNames.length; index++) {
      const fullName = authorNames[index];

      let author = await prisma.author.findFirst({
        where: { fullName },
      });

      if (!author) {
        author = await prisma.author.create({
          data: {
            fullName,
            email: `${fullName
              .toLowerCase()
              .replace(/\s+/g, ".")}@example.com`,
          },
        });
      }

      await prisma.documentAuthor.create({
        data: {
          documentId: document.id,
          authorId: author.id,
          authorOrder: index + 1,
        },
      });
    }

    const keywordTexts = keywordsRaw
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    for (const keywordText of keywordTexts) {
      const keyword = await prisma.keyword.upsert({
        where: { keywordText },
        create: { keywordText },
        update: {},
      });

      await prisma.documentKeyword.create({
        data: {
          documentId: document.id,
          keywordId: keyword.id,
        },
      });
    }

    return NextResponse.json(
      { id: document.id, filePath: publicFilePath },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}

