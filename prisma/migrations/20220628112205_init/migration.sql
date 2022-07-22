/*
  Warnings:

  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Payment`;

-- CreateTable
CREATE TABLE `Donation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `yoomoneyId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `isAutomatic` BOOLEAN NOT NULL DEFAULT false,
    `currency` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `paid` BOOLEAN NOT NULL DEFAULT false,
    `metadata` JSON NOT NULL,
    `paymentMethodId` VARCHAR(191) NULL,
    `paymentMethod` JSON NULL,

    UNIQUE INDEX `Donation_yoomoneyId_key`(`yoomoneyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
