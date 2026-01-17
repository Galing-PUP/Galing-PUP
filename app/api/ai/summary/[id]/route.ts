import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Params is a Promise in Next.js 15+
) {
    const { id } = await params;
    const documentId = parseInt(id);

    if (isNaN(documentId)) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch User Tier
    const dbUser = await prisma.user.findUnique({
        where: { supabaseAuthId: user.id },
        include: { subscriptionTier: true },
    });

    if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check Subscription
    if (dbUser.subscriptionTier.tierName !== "PAID" &&
        dbUser.role !== "ADMIN" &&
        dbUser.role !== "SUPERADMIN" &&
        dbUser.role !== "OWNER") {
        return NextResponse.json({ error: "Premium access required" }, { status: 403 });
    }

    // Fetch Document Summary
    const document = await prisma.document.findUnique({
        where: { id: documentId },
        select: { aiSummary: true }
    });

    if (!document) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ summary: document.aiSummary });
}
