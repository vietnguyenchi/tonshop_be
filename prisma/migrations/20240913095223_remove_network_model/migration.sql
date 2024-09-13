/*
  Warnings:

  - You are about to drop the `Network` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Network` DROP FOREIGN KEY `Network_chainId_fkey`;

-- DropTable
DROP TABLE `Network`;
