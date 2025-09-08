/*
  Warnings:

  - You are about to drop the `comment_replies` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `comment_replies` DROP FOREIGN KEY `comment_replies_commentId_fkey`;

-- AlterTable
ALTER TABLE `comment` ADD COLUMN `parentId` INTEGER NULL;

-- DropTable
DROP TABLE `comment_replies`;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Comment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
