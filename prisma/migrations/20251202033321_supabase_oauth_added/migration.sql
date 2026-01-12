/*
  Warnings:

  - A unique constraint covering the columns `[supabase_uid]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `supabase_uid` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "supabase_uid" UUID NOT NULL,
ALTER COLUMN "password_hash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_supabase_uid_key" ON "users"("supabase_uid");
