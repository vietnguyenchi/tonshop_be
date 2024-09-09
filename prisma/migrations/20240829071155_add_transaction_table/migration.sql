-- CreateTable
CREATE TABLE `transaction` (
    `id` VARCHAR(191) NOT NULL,
    `chargeId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `chargeType` VARCHAR(191) NOT NULL,
    `redirect_ssl` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `walletAddress` VARCHAR(191) NOT NULL,
    `chain` VARCHAR(191) NOT NULL,
    `status` ENUM('waiting', 'success', 'timeout', 'unknow', 'cancel') NOT NULL DEFAULT 'waiting',

    UNIQUE INDEX `transaction_chargeId_key`(`chargeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
