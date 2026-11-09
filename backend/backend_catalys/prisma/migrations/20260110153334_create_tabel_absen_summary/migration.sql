-- CreateTable
CREATE TABLE `AbsenSummary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tanggal` DATETIME(3) NOT NULL,
    `id_karyawan` INTEGER NOT NULL,
    `datang` DATETIME(3) NULL,
    `pulang` DATETIME(3) NULL,
    `status` ENUM('HADIR', 'TERLAMBAT', 'PULANG_CEPAT', 'ALPHA', 'IZIN', 'LEMBUR') NOT NULL,
    `durasi_lembur` INTEGER NULL,
    `keterangan` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AbsenSummary_tanggal_id_karyawan_key`(`tanggal`, `id_karyawan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AbsenSummary` ADD CONSTRAINT `AbsenSummary_id_karyawan_fkey` FOREIGN KEY (`id_karyawan`) REFERENCES `Karyawan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
