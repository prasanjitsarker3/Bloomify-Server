/*
  Warnings:

  - You are about to drop the column `delivery` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "delivery",
ADD COLUMN     "details" TEXT,
ADD COLUMN     "discussion" TEXT;
