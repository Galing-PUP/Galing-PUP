import { prisma } from "@/lib/db"; // Adjust path if needed
import { DocumentChunkParams } from "./chunker";


export interface SearchResult {
  id: bigint;
  documentId: number;
  content: string;
  phrase: string;
  score: number;
  pageStart: number;
  pageEnd: number;
}

/**
 * Saves document chunks to the database using raw SQL.
 * Prisma Client does not support 'Unsupported' types in create/update.
 */
export async function saveDocumentChunks(
  documentId: number,
  chunks: (DocumentChunkParams & { embedding: number[] })[]
) {
  // We process in batches to avoid huge SQL queries
  const BATCH_SIZE = 50;

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);

    const values: string[] = [];

    for (const chunk of batch) {
      // Format vector as string "[0.1,0.2,...]"
      const vectorStr = `[${chunk.embedding.join(",")}]`;

      // Escape strings to prevent SQL injection (basic manual escaping or use numbered params)
      // Using numbered params is safer but complex with dynamic batch insert.
      // Better to use a series of executeRaw calls or constructed query with params.
      // Since vector is long, let's do one insert per chunk or small batch with params.

      // Actually, for safety, let's use $executeRaw per chunk or use a more advanced builder.
      // Given the constraints, a loop with $executeRaw is safest and simplest.

      await prisma.$executeRaw`
        INSERT INTO "document_chunks" (
          "document_id", "content", "phrase", "embedding", 
          "page_start", "page_end", "char_start", "char_end"
        ) VALUES (
          ${documentId}, ${chunk.content}, ${chunk.phrase}, ${vectorStr}::vector,
          ${chunk.pageStart}, ${chunk.pageEnd}, ${chunk.charStart}, ${chunk.charEnd}
        );
      `;
    }
  }
}

/**
 * Performs a semantic search using cosine similarity.
 */
export async function similaritySearch(
  queryEmbedding: number[],
  limit: number = 5,
  similarityThreshold: number = 0.5
): Promise<SearchResult[]> {
  const vectorStr = `[${queryEmbedding.join(",")}]`;

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
  `;

  // Serialize BigInt if needed (Prisma returns BigInt for id)
  return results.map(r => ({
    ...r,
    id: typeof r.id === 'bigint' ? r.id.toString() : r.id, // Convert BigInt to string or number
    score: Number(r.score)
  }));
}
