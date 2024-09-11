/*
  Warnings:

  - A unique constraint covering the columns `[chargeId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `value` to the `Chain` table without a default value. This is not possible if the table is not empty.
  - Added the required column `redirect_ssl` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Chain` ADD COLUMN `value` VARCHAR(191) NOT NULL,
    MODIFY `status` ENUM('active', 'disable', 'maintenance') NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `Transaction` ADD COLUMN `redirect_ssl` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Transaction_chargeId_key` ON `Transaction`(`chargeId`);

-- CreateIndex
CREATE UNIQUE INDEX `Transaction_code_key` ON `Transaction`(`code`);
