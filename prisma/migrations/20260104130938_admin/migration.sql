-- AlterTable
ALTER TABLE "users" ADD COLUMN     "college_id" INTEGER,
ADD COLUMN     "fullname" VARCHAR(255),
ADD COLUMN     "id_number" VARCHAR(100),
ADD COLUMN     "updated_date" DATE,
ADD COLUMN     "upload_id" UUID,
ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "is_verified" SET DEFAULT false;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("college_id") ON DELETE SET NULL ON UPDATE CASCADE;
