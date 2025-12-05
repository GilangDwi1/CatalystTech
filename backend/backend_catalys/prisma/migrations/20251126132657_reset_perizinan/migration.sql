/*
  Warnings:

  - You are about to drop the `perizinan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `perizinan` DROP FOREIGN KEY `Perizinan_id_karyawan_fkey`;

-- DropTable
DROP TABLE `perizinan`;

-- CreateTable
CREATE TABLE `Izin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_karyawan` INTEGER NOT NULL,
    `jenis` ENUM('SAKIT', 'CUTI', 'IZIN', 'WFH') NOT NULL,
    `tanggal_mulai` DATETIME(3) NOT NULL,
    `tanggal_selesai` DATETIME(3) NOT NULL,
    `alasan` VARCHAR(191) NULL,
    `lampiran` VARCHAR(191) NULL,
    `dibuat_pada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dibuat_oleh` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Izin` ADD CONSTRAINT `Izin_id_karyawan_fkey` FOREIGN KEY (`id_karyawan`) REFERENCES `Karyawan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Izin` ADD CONSTRAINT `Izin_dibuat_oleh_fkey` FOREIGN KEY (`dibuat_oleh`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
