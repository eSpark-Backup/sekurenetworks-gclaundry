-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_kioskId_fkey";

-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "kioskId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_kioskId_fkey" FOREIGN KEY ("kioskId") REFERENCES "Kiosk"("macId") ON DELETE SET NULL ON UPDATE CASCADE;
