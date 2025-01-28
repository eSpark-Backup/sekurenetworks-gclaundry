/*
  Warnings:

  - You are about to drop the column `questionId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `selectedAnswer` on the `Transaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_questionId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "questionId",
DROP COLUMN "selectedAnswer";
