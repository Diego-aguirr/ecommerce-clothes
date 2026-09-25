/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `UserAddress` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "deletedAt",
DROP COLUMN "lastLoginAt",
DROP COLUMN "password";

-- AlterTable
ALTER TABLE "UserAddress" DROP COLUMN "sessionId";
