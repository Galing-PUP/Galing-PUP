import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UserStatus } from "@/lib/generated/prisma/enums";

export async function GET() {
    try {
        const [totalUsers, pendingRequests, totalTiers] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({
                where: { status: UserStatus.PENDING },
            }),
            prisma.subscriptionTier.count(),
        ]);

        return NextResponse.json({
            totalUsers,
            pendingRequests,
            totalTiers,
        });
    } catch (error) {
        console.error("Error fetching user stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch user stats" },
            { status: 500 }
        );
    }
}
