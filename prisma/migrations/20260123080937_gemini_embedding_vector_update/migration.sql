-- Manually updated migration to handle Unsupported type change
-- Upgrade embedding vector size from 384 to 768
ALTER TABLE "document_chunks" ALTER COLUMN "embedding" TYPE vector(768);

-- Prevent dropping of search_vector index (Prisma attempts to drop it because it's not in schema)
-- We intentionally do NOTHING regarding the index here.
