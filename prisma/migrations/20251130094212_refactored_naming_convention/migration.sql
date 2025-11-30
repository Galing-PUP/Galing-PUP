/*
  Warnings:

  - You are about to drop the `ACTIVITY_LOG` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AUTHOR` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `COLLEGE` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `COURSE` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DOCUMENT` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DOCUMENT_AUTHOR` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DOCUMENT_KEYWORD` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `KEYWORD` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LIBRARY` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RESOURCE_TYPE` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ROLE` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SUBSCRIPTION_TIER` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `USER` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `USER_BOOKMARK` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ACTIVITY_LOG" DROP CONSTRAINT "ACTIVITY_LOG_Document_ID_fkey";

-- DropForeignKey
ALTER TABLE "ACTIVITY_LOG" DROP CONSTRAINT "ACTIVITY_LOG_User_ID_fkey";

-- DropForeignKey
ALTER TABLE "COURSE" DROP CONSTRAINT "COURSE_College_ID_fkey";

-- DropForeignKey
ALTER TABLE "DOCUMENT" DROP CONSTRAINT "DOCUMENT_Course_ID_fkey";

-- DropForeignKey
ALTER TABLE "DOCUMENT" DROP CONSTRAINT "DOCUMENT_Library_ID_fkey";

-- DropForeignKey
ALTER TABLE "DOCUMENT" DROP CONSTRAINT "DOCUMENT_ResourceType_ID_fkey";

-- DropForeignKey
ALTER TABLE "DOCUMENT" DROP CONSTRAINT "DOCUMENT_Uploader_ID_fkey";

-- DropForeignKey
ALTER TABLE "DOCUMENT_AUTHOR" DROP CONSTRAINT "DOCUMENT_AUTHOR_Author_ID_fkey";

-- DropForeignKey
ALTER TABLE "DOCUMENT_AUTHOR" DROP CONSTRAINT "DOCUMENT_AUTHOR_Document_ID_fkey";

-- DropForeignKey
ALTER TABLE "DOCUMENT_KEYWORD" DROP CONSTRAINT "DOCUMENT_KEYWORD_Document_ID_fkey";

-- DropForeignKey
ALTER TABLE "DOCUMENT_KEYWORD" DROP CONSTRAINT "DOCUMENT_KEYWORD_Keyword_ID_fkey";

-- DropForeignKey
ALTER TABLE "USER" DROP CONSTRAINT "USER_Current_Role_ID_fkey";

-- DropForeignKey
ALTER TABLE "USER" DROP CONSTRAINT "USER_Tier_ID_fkey";

-- DropForeignKey
ALTER TABLE "USER_BOOKMARK" DROP CONSTRAINT "USER_BOOKMARK_Document_ID_fkey";

-- DropForeignKey
ALTER TABLE "USER_BOOKMARK" DROP CONSTRAINT "USER_BOOKMARK_User_ID_fkey";

-- DropTable
DROP TABLE "ACTIVITY_LOG";

-- DropTable
DROP TABLE "AUTHOR";

-- DropTable
DROP TABLE "COLLEGE";

-- DropTable
DROP TABLE "COURSE";

-- DropTable
DROP TABLE "DOCUMENT";

-- DropTable
DROP TABLE "DOCUMENT_AUTHOR";

-- DropTable
DROP TABLE "DOCUMENT_KEYWORD";

-- DropTable
DROP TABLE "KEYWORD";

-- DropTable
DROP TABLE "LIBRARY";

-- DropTable
DROP TABLE "RESOURCE_TYPE";

-- DropTable
DROP TABLE "ROLE";

-- DropTable
DROP TABLE "SUBSCRIPTION_TIER";

-- DropTable
DROP TABLE "USER";

-- DropTable
DROP TABLE "USER_BOOKMARK";

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "registration_date" DATE NOT NULL,
    "is_verified" BOOLEAN NOT NULL,
    "current_role_id" INTEGER NOT NULL,
    "tier_id" INTEGER NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "role_id" SERIAL NOT NULL,
    "role_name" VARCHAR(255) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "subscription_tiers" (
    "tier_id" SERIAL NOT NULL,
    "tier_name" VARCHAR(255) NOT NULL,
    "daily_download_limit" INTEGER NOT NULL,
    "daily_citation_limit" INTEGER NOT NULL,
    "max_bookmarks" INTEGER NOT NULL,
    "has_ads" BOOLEAN NOT NULL,
    "has_ai_insights" BOOLEAN NOT NULL,

    CONSTRAINT "subscription_tiers_pkey" PRIMARY KEY ("tier_id")
);

-- CreateTable
CREATE TABLE "documents" (
    "document_id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "abstract" TEXT NOT NULL,
    "file_path" VARCHAR(255) NOT NULL,
    "date_published" DATE NOT NULL,
    "visibility" VARCHAR(50) NOT NULL,
    "downloads_count" INTEGER NOT NULL DEFAULT 0,
    "citation_count" INTEGER NOT NULL DEFAULT 0,
    "ai_summary" TEXT,
    "ai_insights" TEXT,
    "uploader_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "resource_type_id" INTEGER NOT NULL,
    "library_id" INTEGER NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("document_id")
);

-- CreateTable
CREATE TABLE "user_bookmarks" (
    "user_id" INTEGER NOT NULL,
    "document_id" INTEGER NOT NULL,
    "date_bookmarked" DATE NOT NULL,

    CONSTRAINT "user_bookmarks_pkey" PRIMARY KEY ("user_id","document_id")
);

-- CreateTable
CREATE TABLE "document_authors" (
    "document_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "author_order" INTEGER NOT NULL,

    CONSTRAINT "document_authors_pkey" PRIMARY KEY ("document_id","author_id")
);

-- CreateTable
CREATE TABLE "authors" (
    "author_id" SERIAL NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,

    CONSTRAINT "authors_pkey" PRIMARY KEY ("author_id")
);

-- CreateTable
CREATE TABLE "document_keywords" (
    "document_id" INTEGER NOT NULL,
    "keyword_id" INTEGER NOT NULL,

    CONSTRAINT "document_keywords_pkey" PRIMARY KEY ("document_id","keyword_id")
);

-- CreateTable
CREATE TABLE "keywords" (
    "keyword_id" SERIAL NOT NULL,
    "keyword_text" VARCHAR(255) NOT NULL,

    CONSTRAINT "keywords_pkey" PRIMARY KEY ("keyword_id")
);

-- CreateTable
CREATE TABLE "courses" (
    "course_id" SERIAL NOT NULL,
    "course_name" VARCHAR(255) NOT NULL,
    "course_abbr" VARCHAR(50) NOT NULL,
    "college_id" INTEGER NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("course_id")
);

-- CreateTable
CREATE TABLE "colleges" (
    "college_id" SERIAL NOT NULL,
    "college_name" VARCHAR(255) NOT NULL,
    "college_abbr" VARCHAR(50) NOT NULL,

    CONSTRAINT "colleges_pkey" PRIMARY KEY ("college_id")
);

-- CreateTable
CREATE TABLE "resource_types" (
    "resource_type_id" SERIAL NOT NULL,
    "type_name" VARCHAR(255) NOT NULL,

    CONSTRAINT "resource_types_pkey" PRIMARY KEY ("resource_type_id")
);

-- CreateTable
CREATE TABLE "libraries" (
    "library_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "libraries_pkey" PRIMARY KEY ("library_id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "log_id" BIGSERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "document_id" INTEGER,
    "activity_type" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "keywords_keyword_text_key" ON "keywords"("keyword_text");

-- CreateIndex
CREATE UNIQUE INDEX "colleges_college_name_key" ON "colleges"("college_name");

-- CreateIndex
CREATE UNIQUE INDEX "colleges_college_abbr_key" ON "colleges"("college_abbr");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_current_role_id_fkey" FOREIGN KEY ("current_role_id") REFERENCES "roles"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "subscription_tiers"("tier_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_resource_type_id_fkey" FOREIGN KEY ("resource_type_id") REFERENCES "resource_types"("resource_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_library_id_fkey" FOREIGN KEY ("library_id") REFERENCES "libraries"("library_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_bookmarks" ADD CONSTRAINT "user_bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_bookmarks" ADD CONSTRAINT "user_bookmarks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("document_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_authors" ADD CONSTRAINT "document_authors_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("document_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_authors" ADD CONSTRAINT "document_authors_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "authors"("author_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_keywords" ADD CONSTRAINT "document_keywords_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("document_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_keywords" ADD CONSTRAINT "document_keywords_keyword_id_fkey" FOREIGN KEY ("keyword_id") REFERENCES "keywords"("keyword_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("college_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("document_id") ON DELETE SET NULL ON UPDATE CASCADE;
