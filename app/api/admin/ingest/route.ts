import { chunkDocument } from '@/lib/ai/chunker'
import { generateEmbeddings } from '@/lib/ai/embeddings'
import { extractTextFromPdf } from '@/lib/ai/pdf-loader'
import { saveDocumentChunks } from '@/lib/ai/vector-store'
import { prisma } from '@/lib/db'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // 1. Auth Check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check role using Prisma
  const dbUser = await prisma.user.findUnique({
    where: { supabaseAuthId: user.id },
  })

  if (
    !dbUser ||
    !['ADMIN', 'SUPERADMIN', 'OWNER', 'STAFF'].includes(dbUser.role)
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // Encoder for streaming text
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        const sendUpdate = (
          step: string,
          progress: number,
          message: string,
        ) => {
          const data = JSON.stringify({ step, progress, message }) + '\n'
          try {
            controller.enqueue(encoder.encode(data))
          } catch (e) {
            // Start controller error safety
          }
        }

        try {
          // 1. Process Input
          const { documentId } = await req.json()

          if (!documentId) {
            throw new Error('Missing documentId')
          }

          // 2. Fetch Document Metadata
          const document = await prisma.document.findUnique({
            where: { id: documentId },
          })

          if (!document) {
            throw new Error('Document not found')
          }

          // 3. Load File from Supabase Storage
          sendUpdate(
            'downloading',
            10,
            `Downloading file: ${document.filePath}...`,
          )

          const { data: fileBlob, error: downloadError } =
            await supabaseAdmin.storage
              .from('PDF_UPLOADS')
              .download(document.filePath)

          if (downloadError || !fileBlob) {
            throw new Error('Failed to download file from storage')
          }

          const fileArrayBuffer = await fileBlob.arrayBuffer()
          const fileBuffer = Buffer.from(fileArrayBuffer)
          sendUpdate(
            'downloading',
            20,
            `File downloaded. Size: ${fileBuffer.length} bytes.`,
          )

          // 4. Compute Checksum (SHA-256)
          const crypto = await import('crypto')
          const hashSum = crypto.createHash('sha256')
          hashSum.update(fileBuffer)
          const hexHash = hashSum.digest('hex')

          // Check if re-generation is needed
          // If hash matches matches and aiSummary exists, skip
          // Check if re-generation is needed
          // If hash matches matches and aiSummary exists, skip
          // FORCE PROCESS FOR DEBUGGING
          // if (document.fileHash === hexHash && document.aiSummary) {
          //   sendUpdate(
          //     'complete',
          //     100,
          //     'Document unchanged, skipping AI processing.',
          //   )
          //   controller.close()
          //   return
          // }

          // 5. Extract Text
          sendUpdate('extracting', 30, 'Extracting text from PDF...')
          const pages = await extractTextFromPdf(fileBuffer)

          if (pages.length === 0) {
            throw new Error('No text extracted from PDF')
          }
          sendUpdate('extracting', 40, `Extracted ${pages.length} pages.`)

          // 6. Chunk Text
          const chunks = chunkDocument(pages)
          sendUpdate('extracting', 45, `Created ${chunks.length} chunks.`)

          // 7. Generate Embeddings & Save Chunks
          const EMBEDDING_BATCH_SIZE = 10
          const chunksWithEmbeddings: any[] = []
          sendUpdate('embedding', 50, 'Generating embeddings...')

          for (let i = 0; i < chunks.length; i += EMBEDDING_BATCH_SIZE) {
            const batchParams = chunks.slice(i, i + EMBEDDING_BATCH_SIZE)
            const batchTexts = batchParams.map((c) => c.content)

            // Update progress based on batch
            const progress = 50 + Math.round((i / chunks.length) * 25) // 50-75%
            sendUpdate(
              'embedding',
              progress,
              `Processing batch ${Math.ceil((i + 1) / EMBEDDING_BATCH_SIZE)}...`,
            )

            const embeddings = await generateEmbeddings(batchTexts)

            batchParams.forEach((param, idx) => {
              chunksWithEmbeddings.push({
                ...param,
                embedding: embeddings[idx],
              })
            })
          }

          // Transaction for DB Updates
          await prisma.$transaction(async (tx) => {
            await tx.documentChunk.deleteMany({
              where: { documentId: documentId },
            })
          })

          sendUpdate('embedding', 75, 'Saving chunks to database...')
          await saveDocumentChunks(documentId, chunksWithEmbeddings)

          // 8. Generate AI Summary
          sendUpdate('summarizing', 80, 'Generating AI summary...')

          const savedChunks = await prisma.documentChunk.findMany({
            where: { documentId: documentId },
            orderBy: [{ pageStart: 'asc' }, { charStart: 'asc' }],
          })

          const contextChunks = savedChunks.map((c) => ({
            id: c.id,
            documentId: c.documentId,
            content: c.content,
            phrase: c.phrase,
            pageStart: c.pageStart,
            pageEnd: c.pageEnd,
            charStart: c.charStart,
            charEnd: c.charEnd,
          }))

          const { generateDocumentSummary } = await import('@/lib/ai/summary')
          const summary = await generateDocumentSummary({
            chunks: contextChunks,
          })

          // 9. Update Document
          await prisma.document.update({
            where: { id: documentId },
            data: {
              fileHash: hexHash,
              aiSummary: summary,
            },
          })

          sendUpdate('complete', 100, 'Ingestion complete!')
          controller.close()
        } catch (error: any) {
          console.error('Ingestion error:', error)
          const errorMsg =
            error instanceof Error ? error.message : 'Unknown error'
          sendUpdate('error', 0, errorMsg)
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Ingestion setup error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
