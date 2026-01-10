import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UserStatus } from "@/lib/generated/prisma/enums";

export async function GET() {
    try {
        const [freeUsers, premiumUsers, pendingRequests] = await Promise.all([
            prisma.user.count({
                where: { tierId: 1 },
            }),
            prisma.user.count({
                where: { tierId: 2 },
            }),
            prisma.user.count({
                where: { status: UserStatus.PENDING },
            }),
        ]);

        return NextResponse.json({
            freeUsers,
            premiumUsers,
            pendingRequests,
        });
    } catch (error) {
        console.error("Error fetching user stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch user stats" },
            { status: 500 }
        );
    }
}
