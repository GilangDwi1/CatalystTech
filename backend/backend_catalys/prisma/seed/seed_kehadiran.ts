import {
  PrismaClient,
  JenisAbsen,
  StatusAbsen,
  JenisIzin,
} from '@prisma/client';

const prisma = new PrismaClient();

// ✅ TANGGAL DEMO
const TANGGAL = new Date('2026-01-14T00:00:00.000Z');
const HRD_ID = 2;

async function main() {
  const karyawan = await prisma.karyawan.findMany({
    where: { is_active: true },
  });

  const divisiIds = [...new Set(karyawan.map((k) => k.id_divisi))];

  // ==========================
  // 1. ABSENSI CONFIG
  // ==========================
  async function getOrCreateAbsensiConfig(jenis: JenisAbsen) {
    const existing = await prisma.absensiConfig.findFirst({
      where: { tanggal: TANGGAL, jenis },
    });

    if (existing) return existing;

    if (jenis === JenisAbsen.DATANG) {
      return prisma.absensiConfig.create({
        data: {
          tanggal: TANGGAL,
          jam_mulai: new Date('2026-01-14T06:00:00'),
          batas_absen: new Date('2026-01-14T07:30:00'),
          jam_selesai: new Date('2026-01-14T08:00:00'),
          jenis,
          dibuat_oleh: HRD_ID,
        },
      });
    }

    // PULANG
    return prisma.absensiConfig.create({
      data: {
        tanggal: TANGGAL,
        jam_mulai: new Date('2026-01-14T16:00:00'),
        jam_selesai: new Date('2026-01-14T21:00:00'),
        jenis,
        dibuat_oleh: HRD_ID,
      },
    });
  }

  const configDatang = await getOrCreateAbsensiConfig(JenisAbsen.DATANG);
  const configPulang = await getOrCreateAbsensiConfig(JenisAbsen.PULANG);

  // ==========================
  // 2. ABSEN (ALL KARYAWAN)
  // ==========================
  for (const k of karyawan) {
    await prisma.absen.createMany({
      data: [
        {
          id_karyawan: k.id,
          id_config: configDatang.id,
          waktu: new Date('2026-01-14T08:30:00Z'),
          jenis: JenisAbsen.DATANG,
          status: StatusAbsen.HADIR,
        },
        {
          id_karyawan: k.id,
          id_config: configPulang.id,
          waktu: new Date('2026-01-14T17:05:00Z'),
          jenis: JenisAbsen.PULANG,
          status: StatusAbsen.HADIR,
        },
      ],
      skipDuplicates: true,
    });
  }

  // ==========================
  // 3. IZIN (2 PER DIVISI)
  // ==========================
  for (const divId of divisiIds) {
    const izinKaryawan = karyawan
      .filter((k) => k.id_divisi === divId)
      .slice(0, 2);

    for (const k of izinKaryawan) {
      const izinExist = await prisma.izin.findFirst({
        where: {
          id_karyawan: k.id,
          tanggal_mulai: TANGGAL,
        },
      });

      if (!izinExist) {
        await prisma.izin.create({
          data: {
            id_karyawan: k.id,
            jenis: JenisIzin.SAKIT,
            tanggal_mulai: TANGGAL,
            tanggal_selesai: TANGGAL,
            alasan: 'Seeder test',
            dibuat_oleh: HRD_ID,
          },
        });
      }
    }
  }

  // ==========================
  // 4. CONFIG LEMBUR
  // ==========================
  const configLembur = await prisma.configLembur.upsert({
    where: { tanggal: TANGGAL },
    update: {},
    create: {
      tanggal: TANGGAL,
      jam_mulai: new Date('2026-01-14T17:00:00Z'),
      jam_selesai: new Date('2026-01-14T19:00:00Z'),
    },
  });

  // ==========================
  // 5. LEMBUR (5 PER DIVISI)
  // ==========================
  for (const divId of divisiIds) {
    const lemburKaryawan = karyawan
      .filter((k) => k.id_divisi === divId)
      .slice(0, 5);

    for (const k of lemburKaryawan) {
      await prisma.lembur.upsert({
        where: {
          id_karyawan_id_config_lembur: {
            id_karyawan: k.id,
            id_config_lembur: configLembur.id,
          },
        },
        update: {},
        create: {
          id_karyawan: k.id,
          id_config_lembur: configLembur.id,
          durasi_menit: 120,
          jam_mulai: new Date('2026-01-14T17:00:00Z'),
          jam_selesai: new Date('2026-01-14T19:00:00Z'),
        },
      });
    }
  }

  console.log('✅ Seeder absensi + izin + lembur 14-01-2026 OK');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
