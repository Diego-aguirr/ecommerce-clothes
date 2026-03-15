/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyToken]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "idempotencyToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_idempotencyToken_key" ON "Order"("idempotencyToken");
