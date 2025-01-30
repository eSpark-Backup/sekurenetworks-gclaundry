/*
  Warnings:

  - A unique constraint covering the columns `[studentId]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "studentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Users_studentId_key" ON "Users"("studentId");
