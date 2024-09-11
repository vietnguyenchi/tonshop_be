/*
  Warnings:

  - You are about to drop the `MomoCallback` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `transaction_userId_fkey`;

-- DropTable
DROP TABLE `MomoCallback`;

-- DropTable
DROP TABLE `transaction`;

-- CreateTable
CREATE TABLE `Transaction` (
    `amount` DECIMAL(65, 30) NOT NULL,
    `bank_provider` VARCHAR(191) NOT NULL,
    `chain` VARCHAR(191) NOT NULL,
    `chargeId` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `email` VARCHAR(191) NOT NULL,
    `exchangeRate` DECIMAL(65, 30) NOT NULL,
    `id` VARCHAR(191) NOT NULL,
    `phoneName` VARCHAR(191) NOT NULL,
    `phoneNum` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `qr_url` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `status` ENUM('waiting', 'success', 'timeout', 'unknow', 'cancel') NOT NULL DEFAULT 'waiting',
    `timeToExpired` INTEGER NOT NULL,
    `transactionFee` DECIMAL(65, 30) NOT NULL,
    `updateAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `walletAddress` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chain` (
    `createAt` DATETIME(3) NOT NULL,
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` ENUM('active', 'disable') NOT NULL DEFAULT 'active',
    `updateAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
