/*
  Warnings:

  - Added the required column `requestId` to the `transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `requestId` VARCHAR(191) NOT NULL;
