-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "file_size" INTEGER,
ADD COLUMN     "mime_type" TEXT,
ADD COLUMN     "original_file_name" TEXT;
