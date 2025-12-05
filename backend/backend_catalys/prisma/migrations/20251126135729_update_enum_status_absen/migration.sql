/*
  Warnings:

  - The values [PULANG_CEPAT] on the enum `Absen_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `absen` MODIFY `status` ENUM('HADIR', 'TERLAMBAT', 'ALPHA', 'CUTI', 'SAKIT', 'IZIN', 'WFH') NOT NULL;
