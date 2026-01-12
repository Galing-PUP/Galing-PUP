-- AlterTable: Change date_bookmarked from DATE to TIMESTAMP
-- This allows storing both date and time for better sorting granularity

ALTER TABLE "user_bookmarks" 
ALTER COLUMN "date_bookmarked" TYPE TIMESTAMP(3) USING "date_bookmarked"::timestamp;

-- Set default to current timestamp for new bookmarks
ALTER TABLE "user_bookmarks" 
ALTER COLUMN "date_bookmarked" SET DEFAULT CURRENT_TIMESTAMP;
