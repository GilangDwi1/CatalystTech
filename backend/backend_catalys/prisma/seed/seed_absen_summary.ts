import { PrismaClient, StatusAbsen } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';

const prisma = new PrismaClient();
const TANGGAL = new Date('2026-01-14T00:00:00');

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const start = startOfDay(TANGGAL);
  const end = endOfDay(TANGGAL);

  const karyawan = await prisma.karyawan.findMany({
    where: { is_active: true },
    include: {
      absen: {
        where: {
          waktu: { gte: start, lte: end },
        },
      },
      izin: {
        where: {
          tanggal_mulai: { lte: end },
          tanggal_selesai: { gte: start },
        },
      },
      lembur: {
        where: {
          config: {
            tanggal: { gte: start, lte: end },
          },
        },
        include: { config: true },
      },
    },
  });

  const batasAbsen = new Date('2026-01-14T09:00:00Z');

  for (let i = 0; i < karyawan.length; i++) {
    const k = karyawan[i];

    let datang: Date | null = null;
    let pulang: Date | null = null;

    let status: StatusAbsen = StatusAbsen.HADIR;
    let terlambat = false;
    let pulang_cepat = false;
    let durasi_lembur = 0;
    let lemburFlag = false;
    let keterangan: string | null = null;

    // =====================
    // PRIORITAS STATUS
    // =====================
    if (k.izin.length > 0) {
      status = StatusAbsen.IZIN;
      keterangan = 'Izin';
    } else if (i % 10 === 0) {
      status = StatusAbsen.ALPHA;
      keterangan = 'Alpha';
    } else {
      // =====================
      // DATANG
      // =====================
      datang = new Date(start);
      datang.setHours(8);

      if (i % 6 === 0) {
        // TELAT
        datang.setMinutes(randomBetween(10, 90));
        status = StatusAbsen.TERLAMBAT;
        terlambat = true;
        keterangan = 'Datang terlambat';
      } else {
        datang.setMinutes(randomBetween(0, 10));
      }

      // =====================
      // PULANG
      // =====================
      pulang = new Date(start);
      pulang.setHours(17);

      if (i % 7 === 0) {
        // PULANG CEPAT
        pulang.setMinutes(randomBetween(0, 30));
        pulang_cepat = true;
      } else {
        pulang.setMinutes(randomBetween(0, 59));
      }
    }

    // =====================
    // LEMBUR
    // =====================
    if (status === StatusAbsen.HADIR || status === StatusAbsen.TERLAMBAT) {
      durasi_lembur = k.lembur.reduce((s, l) => s + l.durasi_menit, 0);
      lemburFlag = durasi_lembur > 0;
    }

    await prisma.absenSummary.upsert({
      where: {
        tanggal_id_karyawan: {
          tanggal: start,
          id_karyawan: k.id,
        },
      },
      update: {
        datang,
        pulang,
        status,
        terlambat,
        pulang_cepat,
        durasi_lembur,
        lembur: lemburFlag,
        keterangan,
      },
      create: {
        tanggal: start,
        id_karyawan: k.id,
        datang,
        pulang,
        status,
        terlambat,
        pulang_cepat,
        durasi_lembur,
        lembur: lemburFlag,
        keterangan,
      },
    });

    console.log({ id: k.id, datang, pulang });
  }
  
  console.log('✅ AbsenSummary simulasi TELAT / ALPHA / IZIN / LEMBUR OK');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
