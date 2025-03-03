-- CreateEnum
CREATE TYPE "YesorNo" AS ENUM ('YES', 'NO');

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "building" TEXT,
ADD COLUMN     "classYear" TEXT,
ADD COLUMN     "ethnicity" TEXT,
ADD COLUMN     "expectedMajor" TEXT,
ADD COLUMN     "financialAid" "YesorNo",
ADD COLUMN     "floor" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "lowIncome" "YesorNo",
ADD COLUMN     "referred" TEXT,
ADD COLUMN     "scent" TEXT;
