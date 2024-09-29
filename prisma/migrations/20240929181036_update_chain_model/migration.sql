/*
  Warnings:

  - You are about to drop the column `value` on the `Chain` table. All the data in the column will be lost.
  - Added the required column `network` to the `Chain` table without a default value. This is not possible if the table is not empty.
  - Added the required column `symbol` to the `Chain` table without a default value. This is not possible if the table is not empty.
  - Made the column `apiKey` on table `Chain` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Chain` DROP COLUMN `value`,
    ADD COLUMN `network` VARCHAR(191) NOT NULL,
    ADD COLUMN `symbol` VARCHAR(191) NOT NULL,
    MODIFY `apiKey` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `TransactionTon` MODIFY `status` ENUM('waiting', 'success', 'timeout', 'unknow', 'cancel') NOT NULL DEFAULT 'waiting';
