-- DropIndex
DROP INDEX "document_chunks_embedding_idx";

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "file_hash" TEXT;
