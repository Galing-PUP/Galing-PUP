import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const colleges = await prisma.college.findMany({
            orderBy: {
                collegeName: "asc",
            },
        });
        return NextResponse.json(colleges);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch colleges" },
            { status: 500 }
        );
    }
}
