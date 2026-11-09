import { PrismaClient, JenisAbsen, StatusAbsen } from '@prisma/client';
import { startOfDay, endOfDay, isAfter, isBefore } from 'date-fns';

const prisma = new PrismaClient();

const TANGGAL = new Date('2026-01-14T00:00:00.000Z');

async function syncAbsenSummary(id_karyawan: number, tanggal: Date) {
  const start = startOfDay(tanggal);
  const end = endOfDay(tanggal);

  // ==========================
  // 1. GET DATA
  // ==========================
  const absens = await prisma.absen.findMany({
    where: { id_karyawan, waktu: { gte: start, lte: end } },
  });

  const izin = await prisma.izin.findFirst({
    where: {
      id_karyawan,
      tanggal_mulai: { lte: end },
      tanggal_selesai: { gte: start },
    },
  });

  const lembur = await prisma.lembur.findFirst({
    where: {
      id_karyawan,
      jam_mulai: { gte: start, lte: end },
    },
  });

  const configDatang = await prisma.absensiConfig.findFirst({
    where: { tanggal: { gte: start, lte: end }, jenis: JenisAbsen.DATANG },
  });

  const configPulang = await prisma.absensiConfig.findFirst({
    where: { tanggal: { gte: start, lte: end }, jenis: JenisAbsen.PULANG },
  });

  // ==========================
  // 2. EXTRACT ABSEN
  // ==========================
  const datangRecord = absens.find((a) => a.jenis === JenisAbsen.DATANG);
  const pulangRecord = absens.find((a) => a.jenis === JenisAbsen.PULANG);

  let datangTime = datangRecord?.waktu ?? null;
  let pulangTime = pulangRecord?.waktu ?? null;

  // ==========================
  // 3. DEFAULT
  // ==========================
  let status: StatusAbsen = StatusAbsen.ALPHA;
  let terlambat = false;
  let pulang_cepat = false;
  let durasi_lembur = 0;
  let keterangan = '';

  const isWorkingDay = !!(configDatang || configPulang);

  // ==========================
  // 4. LOGIC
  // ==========================
  if (izin) {
    status = StatusAbsen.IZIN;
    datangTime = null;
    pulangTime = null;
    keterangan = `Izin: ${izin.jenis}`;
  } else if (!isWorkingDay) {
    status = StatusAbsen.LIBUR;
    keterangan = 'Libur';
    if (lembur) {
      durasi_lembur = lembur.durasi_menit;
      keterangan = 'Lembur di Hari Libur';
    }
  } else {
    if (!datangTime) {
      status = StatusAbsen.ALPHA;
      keterangan = 'Tidak Absen Datang';
    } else {
      status = StatusAbsen.HADIR;

      // TERLAMBAT
      if (configDatang) {
        if (isAfter(datangTime, configDatang.jam_mulai)) {
          terlambat = true;
        }
      }

      // PULANG CEPAT
      if (pulangTime && configPulang) {
        if (isBefore(pulangTime, configPulang.jam_mulai)) {
          pulang_cepat = true;
        }
      }

      if (!pulangTime) {
        keterangan = 'Belum / Lupa Absen Pulang';
      }

      if (lembur) {
        durasi_lembur = lembur.durasi_menit;
      }
    }
  }

  // FINAL SAFETY
  if (status === StatusAbsen.ALPHA || status === StatusAbsen.IZIN) {
    durasi_lembur = 0;
  }

  // ==========================
  // 5. UPSERT SUMMARY
  // ==========================
  await prisma.absenSummary.upsert({
    where: {
      tanggal_id_karyawan: {
        tanggal: start,
        id_karyawan,
      },
    },
    update: {
      datang: datangTime,
      pulang: pulangTime,
      status,
      terlambat,
      pulang_cepat,
      durasi_lembur,
      keterangan,
    },
    create: {
      tanggal: start,
      id_karyawan,
      datang: datangTime,
      pulang: pulangTime,
      status,
      terlambat,
      pulang_cepat,
      durasi_lembur,
      keterangan,
    },
  });
}

async function main() {
  const karyawan = await prisma.karyawan.findMany({
    where: { is_active: true },
  });

  for (const k of karyawan) {
    await syncAbsenSummary(k.id, TANGGAL);
  }

  console.log('✅ Seeder AbsenSummary 14-01-2026 OK');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
