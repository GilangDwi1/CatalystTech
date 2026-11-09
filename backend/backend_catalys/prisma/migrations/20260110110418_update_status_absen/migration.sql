/*
  Warnings:

  - The values [CUTI,SAKIT,WFH] on the enum `Absen_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `absen` MODIFY `status` ENUM('HADIR', 'TERLAMBAT', 'PULANG_CEPAT', 'ALPHA', 'IZIN', 'LEMBUR') NOT NULL;

-- AlterTable
ALTER TABLE `izin` MODIFY `jenis` ENUM('TERLAMBAT', 'PULANG_CEPAT', 'SAKIT', 'CUTI', 'IZIN', 'WFH') NOT NULL;
