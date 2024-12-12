-- CreateTable
CREATE TABLE "_UserKiosks" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserKiosks_AB_unique" ON "_UserKiosks"("A", "B");

-- CreateIndex
CREATE INDEX "_UserKiosks_B_index" ON "_UserKiosks"("B");

-- AddForeignKey
ALTER TABLE "_UserKiosks" ADD CONSTRAINT "_UserKiosks_A_fkey" FOREIGN KEY ("A") REFERENCES "Kiosk"("macId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserKiosks" ADD CONSTRAINT "_UserKiosks_B_fkey" FOREIGN KEY ("B") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
