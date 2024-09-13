/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Chain` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rpcUrl` to the `Chain` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Chain` ADD COLUMN `rpcUrl` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Chain_name_key` ON `Chain`(`name`);
