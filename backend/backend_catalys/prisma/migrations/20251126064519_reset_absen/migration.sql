/*
  Warnings:

  - Added the required column `id_config` to the `Absen` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `absen` ADD COLUMN `id_config` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Absen` ADD CONSTRAINT `Absen_id_config_fkey` FOREIGN KEY (`id_config`) REFERENCES `AbsensiConfig`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
