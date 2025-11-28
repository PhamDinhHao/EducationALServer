/*
  Warnings:

  - The values [CONTEST] on the enum `blogs_category` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `blogs` MODIFY `category` ENUM('STUDENT', 'TEACHER', 'MANAGEMENT_STAFF', 'NEW_TECHNOLOGY') NOT NULL DEFAULT 'STUDENT';
