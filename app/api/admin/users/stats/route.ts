import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const [totalUsers, pendingApproval, totalTiers] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({
                where: { isVerified: false },
            }),
            prisma.subscriptionTier.count(),
        ]);

        return NextResponse.json({
            totalUsers,
            pendingApproval,
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
