/*
  Warnings:

  - You are about to drop the column `ai_insights` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `library_id` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `resource_type_id` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `visibility` on the `documents` table. All the data in the column will be lost.
  - The `tier_name` column on the `subscription_tiers` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `current_role_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `is_verified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `upload_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `libraries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `resource_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[title]` on the table `documents` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `first_name` to the `authors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `authors` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('REGISTERED', 'ADMIN', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'APPROVED', 'DELETED');

-- CreateEnum
CREATE TYPE "TierName" AS ENUM ('FREE', 'PAID');

-- CreateEnum
CREATE TYPE "DocStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DELETED');

-- CreateEnum
CREATE TYPE "ResourceTypes" AS ENUM ('THESIS', 'CAPSTONE', 'DISSERTATION', 'ARTICLE', 'RESEARCH_PAPER');

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_library_id_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_resource_type_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_current_role_id_fkey";

-- AlterTable
ALTER TABLE "activity_logs" ALTER COLUMN "activity_type" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "authors" ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "middle_name" TEXT,
ALTER COLUMN "full_name" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "colleges" ALTER COLUMN "college_name" SET DATA TYPE TEXT,
ALTER COLUMN "college_abbr" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "courses" ALTER COLUMN "course_name" SET DATA TYPE TEXT,
ALTER COLUMN "course_abbr" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "documents" DROP COLUMN "ai_insights",
DROP COLUMN "library_id",
DROP COLUMN "resource_type_id",
DROP COLUMN "visibility",
ADD COLUMN     "resource_type" "ResourceTypes" NOT NULL DEFAULT 'THESIS',
ADD COLUMN     "status" "DocStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "title" SET DATA TYPE TEXT,
ALTER COLUMN "file_path" SET DATA TYPE TEXT,
ALTER COLUMN "date_published" DROP NOT NULL;

-- AlterTable
ALTER TABLE "keywords" ALTER COLUMN "keyword_text" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "subscription_tiers" DROP COLUMN "tier_name",
ADD COLUMN     "tier_name" "TierName" NOT NULL DEFAULT 'FREE';

-- AlterTable
ALTER TABLE "user_bookmarks" ALTER COLUMN "date_bookmarked" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "date_bookmarked" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" DROP COLUMN "current_role_id",
DROP COLUMN "is_verified",
DROP COLUMN "upload_id",
ADD COLUMN     "id_image" TEXT,
ADD COLUMN     "role" "RoleName" NOT NULL DEFAULT 'REGISTERED',
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "username" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "password_hash" SET DATA TYPE TEXT,
ALTER COLUMN "fullname" SET DATA TYPE TEXT,
ALTER COLUMN "id_number" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "libraries";

-- DropTable
DROP TABLE "resource_types";

-- DropTable
DROP TABLE "roles";

-- CreateIndex
CREATE UNIQUE INDEX "documents_title_key" ON "documents"("title");

-- CreateIndex
CREATE INDEX "documents_title_idx" ON "documents"("title");
