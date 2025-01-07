-- DropForeignKey
ALTER TABLE "Quote" DROP CONSTRAINT "Quote_kioskId_fkey";

-- AlterTable
ALTER TABLE "Quote" ALTER COLUMN "kioskId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_kioskId_fkey" FOREIGN KEY ("kioskId") REFERENCES "Kiosk"("macId") ON DELETE SET NULL ON UPDATE CASCADE;
