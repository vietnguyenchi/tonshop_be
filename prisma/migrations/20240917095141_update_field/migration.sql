/*
  Warnings:

  - You are about to drop the column `api_key` on the `Chain` table. All the data in the column will be lost.
  - Added the required column `apiKey` to the `Chain` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Chain` DROP COLUMN `api_key`,
    ADD COLUMN `apiKey` VARCHAR(191) NOT NULL;
