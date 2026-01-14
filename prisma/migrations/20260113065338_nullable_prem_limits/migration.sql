-- AlterTable
ALTER TABLE "subscription_tiers" ALTER COLUMN "daily_download_limit" DROP NOT NULL,
ALTER COLUMN "daily_citation_limit" DROP NOT NULL,
ALTER COLUMN "max_bookmarks" DROP NOT NULL;
