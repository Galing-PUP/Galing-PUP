import { prisma } from '@/lib/db' // Adjust path if needed
import { DocumentChunkParams } from './chunker'

export interface SearchResult {
  id: bigint
  documentId: number
  content: string
  phrase: string
  score: number
  pageStart: number
  pageEnd: number
}

/**
 * Saves document chunks to the database using raw SQL.
 * Prisma Client does not support 'Unsupported' types in create/update.
 */
export function cleanText(text: string): string {
  // Remove null bytes and replace lone surrogates/malformed unicode
  return text.replace(/\0/g, '').toWellFormed()
}

/**
 * Saves document chunks to the database using raw SQL.
 * Prisma Client does not support 'Unsupported' types in create/update.
 */
export async function saveDocumentChunks(
  documentId: number,
  chunks: (DocumentChunkParams & { embedding: number[] })[],
) {
  // We process in batches to avoid huge SQL queries
  const BATCH_SIZE = 50

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE)

    for (const chunk of batch) {
      if (!chunk.embedding) {
        console.warn(
          `[VectorStore] Skipping chunk ${chunk.pageStart}-${chunk.pageEnd} due to missing embedding.`,
        )
        continue
      }
      // Format vector as string "[0.1,0.2,...]"
      const vectorStr = `[${chunk.embedding.join(',')}]`

      await prisma.$executeRaw`
        INSERT INTO "document_chunks" (
          "document_id", "content", "phrase", "embedding", 
          "page_start", "page_end", "char_start", "char_end"
        ) VALUES (
          ${documentId}, ${cleanText(chunk.content)}, ${cleanText(chunk.phrase)}, ${vectorStr}::vector,
          ${chunk.pageStart}, ${chunk.pageEnd}, ${chunk.charStart}, ${chunk.charEnd}
        );
      `
    }
  }
}

/**
 * Performs a semantic search using cosine similarity.
 */
export async function similaritySearch(
  queryEmbedding: number[],
  limit: number = 5,
  similarityThreshold: number = 0.5,
): Promise<SearchResult[]> {
  const vectorStr = `[${queryEmbedding.join(',')}]`

  // pgvector operator <=> is cosine distance.
  // Similarity = 1 - distance.
  // We want smallest distance.

  const results = await prisma.$queryRaw<any[]>`
    SELECT 
      id, 
      document_id as "documentId", 
      content, 
      phrase,
      page_start as "pageStart",
      page_end as "pageEnd",
      1 - (embedding <=> ${vectorStr}::vector) as score
    FROM "document_chunks"
    WHERE 1 - (embedding <=> ${vectorStr}::vector) > ${similarityThreshold}
    ORDER BY score DESC
    LIMIT ${limit};
  `

  // Serialize BigInt if needed (Prisma returns BigInt for id)
  return results.map((r) => ({
    ...r,
    id: typeof r.id === 'bigint' ? r.id.toString() : r.id, // Convert BigInt to string or number
    score: Number(r.score),
  }))
}
