import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DocStatus, ResourceTypes } from "@/lib/generated/prisma/enums";
import { formatResourceType } from "@/lib/utils/format";
import type { ContentItem } from "@/types/content";

/**
 * GET /api/admin/approval
 * Fetch all documents for approval management
 * Returns documents in ContentItem format for the approval page
 */
export async function GET() {
  try {
    const documents = await prisma.document.findMany({
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
        uploader: true,
      },
      orderBy: {
        submissionDate: "desc",
      },
    });

    /**
     * Maps database DocStatus enum to ContentItem status
     */
    const mapStatus = (status: DocStatus): ContentItem["status"] => {
      switch (status) {
        case DocStatus.PENDING:
          return "Pending";
        case DocStatus.APPROVED:
          return "Accepted";
        case DocStatus.REJECTED:
          return "Rejected";
        case DocStatus.DELETED:
          return "Deleted";
        default:
          return "Pending";
      }
    };

    /**
     * Maps database ResourceTypes enum to ContentItem resourceType
     * Only maps the types supported by ContentItem
     */
    const mapResourceType = (resourceType: ResourceTypes): ContentItem["resourceType"] => {
      const formatted = formatResourceType(resourceType);
      // Map to ContentItem resourceType values
      if (formatted === "Dissertation") return "Dissertation";
      if (formatted === "Thesis") return "Thesis";
      if (formatted === "Research Paper") return "Research Paper";
      // Default to Thesis for unmapped types (Capstone, Article)
      return "Thesis";
    };

    const formattedDocuments: ContentItem[] = documents.map((doc) => {
      // Format authors as comma-separated string
      const authors = doc.authors.map((da) => da.author.fullName).join(", ");

      // Format keywords as comma-separated string
      const keywords = doc.keywords.map((dk) => dk.keyword.keywordText).join(", ");

      // Format submission date
      const submittedDate = doc.submissionDate
        ? doc.submissionDate.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      // Get college and course info
      const college = doc.course?.college?.collegeName || "N/A";
      const department = doc.course?.courseName || "N/A";
      const campus = "Main Campus (Sta. Mesa)"; // Default campus

      return {
        id: doc.id.toString(),
        title: doc.title,
        abstract: doc.abstract,
        keywords,
        authors,
        adviser: "N/A", // Not in database schema
        submittedDate,
        resourceType: mapResourceType(doc.resourceType),
        status: mapStatus(doc.status),
        visibility: "public", // Default to public, not in schema
        campus,
        college,
        department,
        library: `${college} Library`, // Constructed from college
        fileName: doc.originalFileName || doc.filePath.split("/").pop() || "document.pdf",
      };
    });

    return NextResponse.json(formattedDocuments);
  } catch (error) {
    console.error("Error fetching approval documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch approval documents" },
      { status: 500 }
    );
  }
}
