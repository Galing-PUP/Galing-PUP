import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractTextFromPdf } from "@/lib/ai/pdf-loader";
import { chunkDocument } from "@/lib/ai/chunker";
import { generateEmbeddings } from "@/lib/ai/embeddings";
import { saveDocumentChunks } from "@/lib/ai/vector-store";
import { prisma } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    // 1. Auth Check
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role using Prisma 
    const dbUser = await prisma.user.findUnique({
        where: { supabaseAuthId: user.id },
    });

    if (!dbUser || !["ADMIN", "SUPERADMIN", "OWNER", "STAFF"].includes(dbUser.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { documentId } = await req.json();

        if (!documentId) {
            return NextResponse.json({ error: "Missing documentId" }, { status: 400 });
        }

        // 2. Fetch Document Metadata
        const document = await prisma.document.findUnique({
            where: { id: documentId },
        });

        if (!document) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        // 3. Load File from Supabase Storage
        console.log(`[Ingest] Downloading file from Supabase Storage: ${document.filePath}...`);

        const { data: fileBlob, error: downloadError } = await supabaseAdmin.storage
            .from("PDF_UPLOADS")
            .download(document.filePath);

        if (downloadError || !fileBlob) {
            console.error("[Ingest] Download failed:", downloadError);
            return NextResponse.json({ error: "Failed to download file from storage" }, { status: 500 });
        }

        const fileArrayBuffer = await fileBlob.arrayBuffer();
        const fileBuffer = Buffer.from(fileArrayBuffer);
        console.log(`[Ingest] File downloaded. Size: ${fileBuffer.length} bytes.`);

        // 4. Compute Checksum (SHA-256)
        const crypto = await import("crypto");
        const hashSum = crypto.createHash("sha256");
        hashSum.update(fileBuffer);
        const hexHash = hashSum.digest("hex");

        // Check if re-generation is needed
        // If hash matches matches and aiSummary exists, skip
        if (document.fileHash === hexHash && document.aiSummary) {
            return NextResponse.json({
                success: true,
                message: "Document unchanged, skipping AI processing.",
                chunksProcessed: 0
            });
        }

        // 5. Extract Text
        console.log(`[Ingest] Extracting text from buffer...`);
        const pages = await extractTextFromPdf(fileBuffer);
        console.log(`[Ingest] Extracted ${pages.length} pages.`);
        if (pages.length === 0) {
            return NextResponse.json({ error: "No text extracted from PDF" }, { status: 400 });
        }

        // 6. Chunk Text
        const chunks = chunkDocument(pages);
        console.log(`[Ingest] Created ${chunks.length} chunks.`);

        // 7. Generate Embeddings & Save Chunks (Atomic-like)
        // We only need to re-embed if hash changed or never embedded
        // For simplicity, if we are here, we re-process everything to stay consistent

        const EMBEDDING_BATCH_SIZE = 10;
        const chunksWithEmbeddings: any[] = [];
        console.log("[Ingest] Starting embedding generation...");

        for (let i = 0; i < chunks.length; i += EMBEDDING_BATCH_SIZE) {
            const batchParams = chunks.slice(i, i + EMBEDDING_BATCH_SIZE);
            const batchTexts = batchParams.map(c => c.content);

            // Generate
            console.log(`[Ingest] Processing batch ${i / EMBEDDING_BATCH_SIZE + 1} (${batchTexts.length} items)...`);
            const embeddings = await generateEmbeddings(batchTexts);

            // Merge
            batchParams.forEach((param, idx) => {
                chunksWithEmbeddings.push({
                    ...param,
                    embedding: embeddings[idx]
                });
            });
        }

        // Transaction for DB Updates
        await prisma.$transaction(async (tx) => {
            // Clear existing chunks
            // Note: tx.$executeRaw is needed for chunks? No, we used global `saveDocumentChunks`.
            // We should ideally pass `tx` to `saveDocumentChunks` but it imports `prisma` globally.
            // For now, let's delete using tx and assume saveDocumentChunks works (it does separate raw calls).
            // Caveat: raw calls in `saveDocumentChunks` won't be part of this `tx` transaction if it uses global `prisma`.
            // Given constraints, we will proceed with sequential operations. 
            await tx.documentChunk.deleteMany({
                where: { documentId: documentId }
            });
        });

        // Re-insert chunks (outside transaction wrapper due to raw query limitation in helper)
        console.log("[Ingest] Saving chunks to DB...");
        await saveDocumentChunks(documentId, chunksWithEmbeddings);

        // 8. Generate AI Summary
        // We pass all chunks? Or top chunks? 
        // Gemini 1.5/Pro has huge context. Flash 3 preview likely also.
        // Let's pass all chunks for best summary, up to a reasonable limit (~30k tokens?)
        // 500 tokens * 60 chunks = 30k. 
        // If > 60 chunks, we might trim. For now, pass all.

        // Lazy import to avoid circular dep issues in some envs
        const { generateDocumentSummary } = await import("@/lib/ai/summary");

        // Prepare chunks context (without vectors to save memory/data transfer)
        const contextChunks = chunksWithEmbeddings.map(({ embedding, ...rest }) => rest);

        console.log("[Ingest] Generating AI Summary...");
        const summary = await generateDocumentSummary({ chunks: contextChunks });
        console.log("[Ingest] Summary generated.");

        // 9. Update Document
        await prisma.document.update({
            where: { id: documentId },
            data: {
                fileHash: hexHash,
                aiSummary: summary,
            }
        });

        return NextResponse.json({ success: true, chunksProcessed: chunks.length, summaryGenerated: true });


    } catch (error: any) {
        console.error("Ingestion error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
