/*
  Warnings:

  - You are about to drop the column `source` on the `asset` table. All the data in the column will be lost.
  - Added the required column `src` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `asset` DROP COLUMN `source`,
    ADD COLUMN `src` VARCHAR(191) NOT NULL;
