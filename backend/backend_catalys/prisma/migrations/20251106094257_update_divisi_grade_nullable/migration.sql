-- DropForeignKey
ALTER TABLE `absen` DROP FOREIGN KEY `Absen_id_karyawan_fkey`;

-- DropForeignKey
ALTER TABLE `karyawan` DROP FOREIGN KEY `Karyawan_id_divisi_fkey`;

-- DropForeignKey
ALTER TABLE `karyawan` DROP FOREIGN KEY `Karyawan_id_grade_fkey`;

-- DropForeignKey
ALTER TABLE `perizinan` DROP FOREIGN KEY `Perizinan_id_karyawan_fkey`;

-- DropIndex
DROP INDEX `Absen_id_karyawan_fkey` ON `absen`;

-- DropIndex
DROP INDEX `Karyawan_id_divisi_fkey` ON `karyawan`;

-- DropIndex
DROP INDEX `Karyawan_id_grade_fkey` ON `karyawan`;

-- DropIndex
DROP INDEX `Perizinan_id_karyawan_fkey` ON `perizinan`;

-- AlterTable
ALTER TABLE `divisi` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `grade` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `karyawan` MODIFY `id_divisi` INTEGER NULL,
    MODIFY `id_grade` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Karyawan` ADD CONSTRAINT `Karyawan_id_divisi_fkey` FOREIGN KEY (`id_divisi`) REFERENCES `Divisi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Karyawan` ADD CONSTRAINT `Karyawan_id_grade_fkey` FOREIGN KEY (`id_grade`) REFERENCES `Grade`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Absen` ADD CONSTRAINT `Absen_id_karyawan_fkey` FOREIGN KEY (`id_karyawan`) REFERENCES `Karyawan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Perizinan` ADD CONSTRAINT `Perizinan_id_karyawan_fkey` FOREIGN KEY (`id_karyawan`) REFERENCES `Karyawan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
