/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `authors` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "authors" ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "authors_email_key" ON "authors"("email");
