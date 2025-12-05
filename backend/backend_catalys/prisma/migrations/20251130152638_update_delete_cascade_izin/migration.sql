-- DropForeignKey
ALTER TABLE `izin` DROP FOREIGN KEY `Izin_id_karyawan_fkey`;

-- DropIndex
DROP INDEX `Izin_id_karyawan_fkey` ON `izin`;

-- AddForeignKey
ALTER TABLE `Izin` ADD CONSTRAINT `Izin_id_karyawan_fkey` FOREIGN KEY (`id_karyawan`) REFERENCES `Karyawan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
