/*
  Warnings:

  - You are about to drop the column `NIP` on the `absen` table. All the data in the column will be lost.
  - You are about to drop the column `id_perizinan` on the `absen` table. All the data in the column will be lost.
  - You are about to drop the column `wkt_datang` on the `absen` table. All the data in the column will be lost.
  - You are about to drop the column `wkt_pulang` on the `absen` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `absen` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.
  - You are about to drop the column `NIP` on the `perizinan` table. All the data in the column will be lost.
  - You are about to drop the column `tgl_izin` on the `perizinan` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `id_karyawan` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Karyawan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jenis` to the `Absen` table without a default value. This is not possible if the table is not empty.
  - Added the required column `waktu` to the `Absen` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tgl_mulai` to the `Perizinan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nama` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `absen` DROP FOREIGN KEY `Absen_id_perizinan_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_id_karyawan_fkey`;

-- DropIndex
DROP INDEX `Absen_id_perizinan_fkey` ON `absen`;

-- DropIndex
DROP INDEX `User_id_karyawan_key` ON `user`;

-- AlterTable
ALTER TABLE `absen` DROP COLUMN `NIP`,
    DROP COLUMN `id_perizinan`,
    DROP COLUMN `wkt_datang`,
    DROP COLUMN `wkt_pulang`,
    ADD COLUMN `device_id` VARCHAR(191) NULL,
    ADD COLUMN `jenis` ENUM('DATANG', 'PULANG') NOT NULL,
    ADD COLUMN `lokasi` VARCHAR(191) NULL,
    ADD COLUMN `waktu` DATETIME(3) NOT NULL,
    MODIFY `status` ENUM('HADIR', 'TERLAMBAT', 'PULANG_CEPAT', 'IZIN', 'SAKIT') NOT NULL;

-- AlterTable
ALTER TABLE `divisi` ALTER COLUMN `updated_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `grade` ALTER COLUMN `updated_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `karyawan` ADD COLUMN `userId` INTEGER NULL;

-- AlterTable
ALTER TABLE `perizinan` DROP COLUMN `NIP`,
    DROP COLUMN `tgl_izin`,
    ADD COLUMN `tgl_mulai` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `created_at`,
    DROP COLUMN `id_karyawan`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `nama` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `AbsensiConfig` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tanggal` DATETIME(3) NOT NULL,
    `jam_mulai` DATETIME(3) NOT NULL,
    `jam_selesai` DATETIME(3) NOT NULL,
    `jenis` ENUM('DATANG', 'PULANG') NOT NULL,
    `dibuat_oleh` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KaryawanFace` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_karyawan` INTEGER NOT NULL,
    `foto_url` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FaceEmbedding` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_karyawan` INTEGER NOT NULL,
    `embedding` JSON NOT NULL,
    `source` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `FaceEmbedding_id_karyawan_key`(`id_karyawan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Karyawan_userId_key` ON `Karyawan`(`userId`);

-- CreateIndex
CREATE UNIQUE INDEX `User_email_key` ON `User`(`email`);

-- AddForeignKey
ALTER TABLE `Karyawan` ADD CONSTRAINT `Karyawan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AbsensiConfig` ADD CONSTRAINT `AbsensiConfig_dibuat_oleh_fkey` FOREIGN KEY (`dibuat_oleh`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KaryawanFace` ADD CONSTRAINT `KaryawanFace_id_karyawan_fkey` FOREIGN KEY (`id_karyawan`) REFERENCES `Karyawan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FaceEmbedding` ADD CONSTRAINT `FaceEmbedding_id_karyawan_fkey` FOREIGN KEY (`id_karyawan`) REFERENCES `Karyawan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
