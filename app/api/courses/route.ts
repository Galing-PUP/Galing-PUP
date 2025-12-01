import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET() {
  const courses = await prisma.course.findMany({
    orderBy: { courseName: "asc" },
    select: {
      id: true,
      courseName: true,
    },
  });

  return NextResponse.json(courses);
}

