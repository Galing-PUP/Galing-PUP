'use server'

import { generateDocumentSummary } from '@/lib/ai/summary'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function regenerateSummary(documentId: number) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    // Check permissions
    const dbUser = await prisma.user.findUnique({
      where: { supabaseAuthId: user.id },
      select: { id: true, role: true },
    })

    if (!dbUser || (dbUser.role !== 'OWNER' && dbUser.role !== 'SUPERADMIN')) {
      throw new Error('Insufficient permissions')
    }

    // Fetch document chunks
    const chunks = await prisma.documentChunk.findMany({
      where: { documentId },
      orderBy: { id: 'asc' },
    })

    if (!chunks.length) {
      throw new Error('No chunks found for this document')
    }

    // Map chunks to expected format for generateDocumentSummary
    const formattedChunks = chunks.map((chunk) => ({
      id: chunk.id,
      documentId: chunk.documentId,
      content: chunk.content,
      phrase: chunk.phrase,
      pageStart: chunk.pageStart,
      pageEnd: chunk.pageEnd,
      charStart: chunk.charStart,
      charEnd: chunk.charEnd,
      embedding: [], // Embedding not needed for summary generation if we already have chunks, but type might require it?
      // checking lib/ai/summary.ts, the interface is:
      // chunks: (DocumentChunkParams & { id?: string | bigint | number; documentId?: number; embedding?: number[] })[]
      // DocumentChunkParams has content, etc. embedding is optional in the & part?
      // Let's check DocumentChunkParams definition if I can.
      // Assuming embedding is optional or I can pass empty.
    }))

    // Generate new summary
    const newSummary = await generateDocumentSummary({
      chunks: formattedChunks,
    })

    // Update document
    await prisma.document.update({
      where: { id: documentId },
      data: { aiSummary: newSummary },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: dbUser.id,
        documentId,
        activityType: 'REGENERATE_INSIGHTS',
      },
    })

    revalidatePath(`/admin/publication/edit/${documentId}`)

    return { success: true, summary: newSummary }
  } catch (error) {
    console.error('Failed to regenerate summary:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
