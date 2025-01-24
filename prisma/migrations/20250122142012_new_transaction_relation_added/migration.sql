-- CreateTable
CREATE TABLE "TransactionQuestion" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT,

    CONSTRAINT "TransactionQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TransactionQuestion_transactionId_questionId_key" ON "TransactionQuestion"("transactionId", "questionId");

-- AddForeignKey
ALTER TABLE "TransactionQuestion" ADD CONSTRAINT "TransactionQuestion_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionQuestion" ADD CONSTRAINT "TransactionQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
