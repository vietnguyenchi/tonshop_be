-- CreateTable
CREATE TABLE `MomoCallback` (
    `id` VARCHAR(191) NOT NULL,
    `chargeId` VARCHAR(191) NULL,
    `chargeType` VARCHAR(191) NULL,
    `chargeCode` VARCHAR(191) NULL,
    `regAmount` DOUBLE NULL,
    `chargeAmount` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `orderId` VARCHAR(191) NULL,
    `requestId` VARCHAR(191) NULL,
    `signature` VARCHAR(191) NULL,
    `momoTransId` VARCHAR(191) NULL,
    `result` VARCHAR(191) NULL,
    `usdtRate` DOUBLE NULL,
    `usdAmount` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
