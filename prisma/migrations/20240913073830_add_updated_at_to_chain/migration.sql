/*
  Warnings:

  - You are about to drop the column `createAt` on the `Chain` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `Chain` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Chain` table. All the data in the column will be lost.
  - The values [disable] on the enum `Chain_status` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `updatedAt` to the `Chain` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Chain` DROP COLUMN `createAt`,
    DROP COLUMN `updateAt`,
    DROP COLUMN `value`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `status` ENUM('active', 'disabled', 'maintenance') NOT NULL DEFAULT 'active';

-- CreateTable
CREATE TABLE `Network` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `rpcUrl` VARCHAR(191) NOT NULL,
    `chainId` VARCHAR(191) NOT NULL,
    `status` ENUM('active', 'disabled', 'maintenance') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Network` ADD CONSTRAINT `Network_chainId_fkey` FOREIGN KEY (`chainId`) REFERENCES `Chain`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
