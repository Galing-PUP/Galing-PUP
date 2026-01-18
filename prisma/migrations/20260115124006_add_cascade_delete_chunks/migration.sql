-- DropForeignKey
ALTER TABLE "document_chunks" DROP CONSTRAINT "document_chunks_document_id_fkey";

-- AddForeignKey
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("document_id") ON DELETE CASCADE ON UPDATE CASCADE;
