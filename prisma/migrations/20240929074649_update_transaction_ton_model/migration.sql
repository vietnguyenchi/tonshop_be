/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `TransactionTon` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `TransactionTon` ADD COLUMN `quantity` DOUBLE NULL,
    ADD COLUMN `status` ENUM('waiting', 'success', 'unknow', 'cancel') NOT NULL DEFAULT 'waiting',
    MODIFY `lt_start` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `TransactionTon_code_key` ON `TransactionTon`(`code`);
