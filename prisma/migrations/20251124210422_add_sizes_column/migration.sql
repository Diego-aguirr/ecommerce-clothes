/*
  Warnings:

  - The values [woman] on the enum `Gender` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `Size` on the `Product` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Gender_new" AS ENUM ('men', 'women', 'kid', 'unisex');
ALTER TABLE "Product" ALTER COLUMN "gender" TYPE "Gender_new" USING ("gender"::text::"Gender_new");
ALTER TYPE "Gender" RENAME TO "Gender_old";
ALTER TYPE "Gender_new" RENAME TO "Gender";
DROP TYPE "public"."Gender_old";
COMMIT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "Size",
ADD COLUMN     "sizes" "Size"[] DEFAULT ARRAY[]::"Size"[];
