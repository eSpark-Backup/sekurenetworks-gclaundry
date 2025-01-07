-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('QUESTION', 'QUOTE');

-- CreateEnum
CREATE TYPE "TissueType" AS ENUM ('scented', 'unscented');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('M', 'F', 'Other');

-- CreateEnum
CREATE TYPE "SubscriptionTypes" AS ENUM ('PAID', 'FREE');

-- CreateEnum
CREATE TYPE "KioskType" AS ENUM ('AUTH', 'OPEN');

-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('ERROR', 'WARNING', 'INFO');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "type" "LogType" NOT NULL,
    "kioskId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "tissueType" "TissueType" NOT NULL,
    "status" "Status" NOT NULL,
    "selectedAnswer" TEXT,
    "error" TEXT,
    "questionId" TEXT,
    "quoteId" TEXT,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kioskId" TEXT NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kiosk" (
    "macId" TEXT NOT NULL,
    "type" "KioskType" NOT NULL DEFAULT 'OPEN',
    "errors" JSONB NOT NULL DEFAULT '[]',
    "name" TEXT NOT NULL,
    "sheets_per_transaction" INTEGER NOT NULL DEFAULT 5,
    "answer_required" BOOLEAN NOT NULL DEFAULT false,
    "screen_sequence" JSONB NOT NULL DEFAULT '["WelcomeScreen", "LoginScreen", "SelectScreen", "SurveyScreen", "QuotesScreen"]',
    "machineInfo" JSONB NOT NULL DEFAULT '{}',
    "location" JSONB NOT NULL DEFAULT '{}',
    "scented" INTEGER NOT NULL DEFAULT 0,
    "unscented" INTEGER NOT NULL DEFAULT 0,
    "temperature" INTEGER NOT NULL DEFAULT 0,
    "customerId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Kiosk_pkey" PRIMARY KEY ("macId")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "kioskId" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "kioskId" TEXT NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KioskRelation" (
    "id" TEXT NOT NULL,
    "kioskId" TEXT NOT NULL,
    "questionId" TEXT,
    "quoteId" TEXT,
    "type" "RelationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KioskRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnSiteContact" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "kioskId" TEXT NOT NULL,

    CONSTRAINT "OnSiteContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kiosk_macId_key" ON "Kiosk"("macId");

-- CreateIndex
CREATE INDEX "Kiosk_customerId_idx" ON "Kiosk"("customerId");

-- CreateIndex
CREATE INDEX "KioskRelation_kioskId_questionId_quoteId_idx" ON "KioskRelation"("kioskId", "questionId", "quoteId");

-- CreateIndex
CREATE UNIQUE INDEX "OnSiteContact_kioskId_key" ON "OnSiteContact"("kioskId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_kioskId_fkey" FOREIGN KEY ("kioskId") REFERENCES "Kiosk"("macId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_kioskId_fkey" FOREIGN KEY ("kioskId") REFERENCES "Kiosk"("macId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kiosk" ADD CONSTRAINT "Kiosk_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_kioskId_fkey" FOREIGN KEY ("kioskId") REFERENCES "Kiosk"("macId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_kioskId_fkey" FOREIGN KEY ("kioskId") REFERENCES "Kiosk"("macId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KioskRelation" ADD CONSTRAINT "KioskRelation_kioskId_fkey" FOREIGN KEY ("kioskId") REFERENCES "Kiosk"("macId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KioskRelation" ADD CONSTRAINT "KioskRelation_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KioskRelation" ADD CONSTRAINT "KioskRelation_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnSiteContact" ADD CONSTRAINT "OnSiteContact_kioskId_fkey" FOREIGN KEY ("kioskId") REFERENCES "Kiosk"("macId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
