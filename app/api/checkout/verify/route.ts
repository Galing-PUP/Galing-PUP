import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionStatus } from "@/lib/xendit";

const PREMIUM_TIER_ID = 2;

/**
 * POST /api/checkout/verify
 * Verifies payment status after user returns from Xendit payment page
 * @param request - JSON body with { referenceId: string }
 * @returns Payment verification result and user upgrade status
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json();
    const { referenceId } = body;

    if (!referenceId) {
      return NextResponse.json(
        { error: "Reference ID is required" },
        { status: 400 }
      );
    }

    // 2. Query database for transaction by referenceId
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { referenceId },
      include: { user: true },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // 3. If already completed, return success
    if (transaction.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        alreadyUpgraded: true,
        message: "You are already a premium member",
      });
    }

    // 4. Fetch session status from Xendit
    const sessionStatus = await getSessionStatus(transaction.sessionId);

    // 5. Check if payment is completed
    if (sessionStatus.status === "PAID" || sessionStatus.status === "COMPLETED") {
      // 6. Update user to premium tier
      await prisma.user.update({
        where: { id: transaction.userId },
        data: { tierId: PREMIUM_TIER_ID },
      });

      // 7. Update transaction status
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: { status: "COMPLETED" },
      });

      // 8. Log activity
      await prisma.activityLog.create({
        data: {
          userId: transaction.userId,
          activityType: "PREMIUM_UPGRADE",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Premium upgrade successful!",
      });
    } else if (
      sessionStatus.status === "FAILED" ||
      sessionStatus.status === "CANCELLED"
    ) {
      // Update transaction status to match Xendit status
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: { status: sessionStatus.status },
      });

      return NextResponse.json(
        {
          success: false,
          error: `Payment ${sessionStatus.status.toLowerCase()}`,
        },
        { status: 400 }
      );
    } else {
      // Payment still pending
      return NextResponse.json(
        {
          success: false,
          error: "Payment is still pending. Please try again in a moment.",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      {
        error: "Failed to verify payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
