-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `telegramId` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `hash` VARCHAR(191) NOT NULL,
    `authDate` DATETIME(3) NOT NULL,
    `photoUrl` VARCHAR(191) NULL,
    `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_telegramId_key`(`telegramId`),
    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `redirect_ssl` VARCHAR(191) NOT NULL,
    `telegramId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Transaction_chargeId_key`(`chargeId`),
    UNIQUE INDEX `Transaction_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chain` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `rpcUrl` VARCHAR(191) NOT NULL,
    `apiKey` VARCHAR(191) NULL,
    `status` ENUM('active', 'disabled', 'maintenance') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Chain_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Wallet` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `privateKey` VARCHAR(191) NOT NULL,
    `status` ENUM('active', 'disabled') NOT NULL DEFAULT 'disabled',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Wallet_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransactionTon` (
    `id` VARCHAR(191) NOT NULL,
    `lt_start` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `lt` VARCHAR(191) NULL,
    `hash` VARCHAR(191) NULL,
    `code` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
