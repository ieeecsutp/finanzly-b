/*
  Warnings:

  - You are about to drop the column `fechaRevocacion` on the `RefreshToken` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."RefreshToken" DROP COLUMN "fechaRevocacion",
ADD COLUMN     "Revocado" BOOLEAN NOT NULL DEFAULT false;
