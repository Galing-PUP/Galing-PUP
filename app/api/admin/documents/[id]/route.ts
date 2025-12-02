import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

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


