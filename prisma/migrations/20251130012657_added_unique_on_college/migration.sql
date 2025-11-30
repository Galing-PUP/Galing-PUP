/*
  Warnings:

  - A unique constraint covering the columns `[College_Name]` on the table `COLLEGE` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[College_Abbr]` on the table `COLLEGE` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "COLLEGE_College_Name_key" ON "COLLEGE"("College_Name");

-- CreateIndex
CREATE UNIQUE INDEX "COLLEGE_College_Abbr_key" ON "COLLEGE"("College_Abbr");
