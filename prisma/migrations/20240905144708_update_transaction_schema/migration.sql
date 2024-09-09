-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `transaction_userId_fkey`;

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`telegramId`) ON DELETE RESTRICT ON UPDATE CASCADE;
