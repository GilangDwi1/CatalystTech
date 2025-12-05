/*
  Warnings:

  - A unique constraint covering the columns `[NIK]` on the table `Karyawan` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `karyawan` ADD COLUMN `NIK` VARCHAR(191) NULL,
    ADD COLUMN `tanggal_lahir` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Karyawan_NIK_key` ON `Karyawan`(`NIK`);
