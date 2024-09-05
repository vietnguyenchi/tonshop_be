/*
  Warnings:

  - Added the required column `exchangeRate` to the `transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `exchangeRate` DOUBLE NOT NULL,
    ADD COLUMN `transactionFee` DOUBLE NOT NULL DEFAULT 0;
