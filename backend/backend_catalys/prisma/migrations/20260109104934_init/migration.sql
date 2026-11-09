-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `NIP` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_NIP_key`(`NIP`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Karyawan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `NIP` VARCHAR(191) NOT NULL,
    `NIK` VARCHAR(191) NULL,
    `tanggal_lahir` DATETIME(3) NULL,
    `nama` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `id_divisi` INTEGER NULL,
    `id_grade` INTEGER NULL,
    `foto` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `userId` INTEGER NULL,

    UNIQUE INDEX `Karyawan_NIP_key`(`NIP`),
    UNIQUE INDEX `Karyawan_NIK_key`(`NIK`),
    UNIQUE INDEX `Karyawan_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Divisi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_divisi` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Grade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `grade` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Absen` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_karyawan` INTEGER NOT NULL,
    `id_config` INTEGER NOT NULL,
    `waktu` DATETIME(3) NULL,
    `jenis` ENUM('DATANG', 'PULANG') NOT NULL,
    `status` ENUM('HADIR', 'TERLAMBAT', 'PULANG_CEPAT', 'ALPHA', 'CUTI', 'SAKIT', 'IZIN', 'WFH', 'LEMBUR') NOT NULL,
    `device_id` VARCHAR(191) NULL,
    `lokasi` VARCHAR(191) NULL,
    `keterangan` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Absen_id_karyawan_id_config_key`(`id_karyawan`, `id_config`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `AbsensiConfig` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tanggal` DATETIME(3) NOT NULL,
    `jam_mulai` DATETIME(3) NOT NULL,
    `batas_absen` DATETIME(3) NULL,
    `jam_selesai` DATETIME(3) NOT NULL,
    `jenis` ENUM('DATANG', 'PULANG') NOT NULL,
    `dibuat_oleh` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `alpha_generated` BOOLEAN NOT NULL DEFAULT false,

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

-- CreateTable
CREATE TABLE `Lembur` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_karyawan` INTEGER NOT NULL,
    `id_config_lembur` INTEGER NOT NULL,
    `durasi_menit` INTEGER NOT NULL,
    `jam_mulai` DATETIME(3) NOT NULL,
    `jam_selesai` DATETIME(3) NOT NULL,
    `dibuat_pada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Lembur_id_karyawan_id_config_lembur_key`(`id_karyawan`, `id_config_lembur`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConfigLembur` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tanggal` DATETIME(3) NOT NULL,
    `jam_mulai` DATETIME(3) NOT NULL,
    `jam_selesai` DATETIME(3) NOT NULL,
    `dibuat_pada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ConfigLembur_tanggal_key`(`tanggal`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Karyawan` ADD CONSTRAINT `Karyawan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Karyawan` ADD CONSTRAINT `Karyawan_id_divisi_fkey` FOREIGN KEY (`id_divisi`) REFERENCES `Divisi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Karyawan` ADD CONSTRAINT `Karyawan_id_grade_fkey` FOREIGN KEY (`id_grade`) REFERENCES `Grade`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Absen` ADD CONSTRAINT `Absen_id_karyawan_fkey` FOREIGN KEY (`id_karyawan`) REFERENCES `Karyawan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Absen` ADD CONSTRAINT `Absen_id_config_fkey` FOREIGN KEY (`id_config`) REFERENCES `AbsensiConfig`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Izin` ADD CONSTRAINT `Izin_id_karyawan_fkey` FOREIGN KEY (`id_karyawan`) REFERENCES `Karyawan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Izin` ADD CONSTRAINT `Izin_dibuat_oleh_fkey` FOREIGN KEY (`dibuat_oleh`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AbsensiConfig` ADD CONSTRAINT `AbsensiConfig_dibuat_oleh_fkey` FOREIGN KEY (`dibuat_oleh`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KaryawanFace` ADD CONSTRAINT `KaryawanFace_id_karyawan_fkey` FOREIGN KEY (`id_karyawan`) REFERENCES `Karyawan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FaceEmbedding` ADD CONSTRAINT `FaceEmbedding_id_karyawan_fkey` FOREIGN KEY (`id_karyawan`) REFERENCES `Karyawan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lembur` ADD CONSTRAINT `Lembur_id_karyawan_fkey` FOREIGN KEY (`id_karyawan`) REFERENCES `Karyawan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lembur` ADD CONSTRAINT `Lembur_id_config_lembur_fkey` FOREIGN KEY (`id_config_lembur`) REFERENCES `ConfigLembur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
