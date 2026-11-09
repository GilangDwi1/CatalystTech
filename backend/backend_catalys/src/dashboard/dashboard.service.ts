import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatusAbsen } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(tanggal?: string) {
    // ===============================
    // 1️⃣ Tentukan tanggal & Range
    // ===============================
    const date = tanggal ? new Date(tanggal) : new Date();
    const start = startOfDay(date);
    const end = endOfDay(date);

    // ===============================
    // 2️⃣ Cek Config (Hari Kerja?)
    // ===============================
    const configs = await this.prisma.absensiConfig.findMany({
      where: { tanggal: { gte: start, lte: end } },
    });
    const isWorkingDay = configs.length > 0;

    // ===============================
    // 3️⃣ Ambil semua karyawan aktif
    // ===============================
    const karyawanList = await this.prisma.karyawan.findMany({
      where: { is_active: true },
      select: { id: true },
    });

    // ===============================
    // 4️⃣ Ambil AbsenSummary (Single Source of Truth)
    // ===============================
    const summaries = await this.prisma.absenSummary.findMany({
      where: {
        tanggal: { gte: start, lte: end },
      },
    });

    const summaryMap = new Map<number, (typeof summaries)[0]>();
    summaries.forEach((s) => summaryMap.set(s.id_karyawan, s));

    // ===============================
    // 5️⃣ Aggregation Loop
    // ===============================
    const result = {
      Jumlah_Karyawan: karyawanList.length,
      Hadir: 0,
      Terlambat: 0,
      Pulang_Cepat: 0,
      Alpha: 0,
      Izin: 0,
      Lembur: 0,
      Libur: 0,
    };

    for (const k of karyawanList) {
      const s = summaryMap.get(k.id);

      // Resolve Status
      let status: StatusAbsen = StatusAbsen.ALPHA;

      if (!isWorkingDay) {
        status = StatusAbsen.LIBUR;
      } else if (s) {
        status = s.status;
      } else {
        // Hari kerja tapi tidak ada summary -> ALPHA
        status = StatusAbsen.ALPHA;
      }

      // Increment Counters
      if (status === StatusAbsen.HADIR) result.Hadir++;
      if (status === StatusAbsen.ALPHA) result.Alpha++;
      if (status === StatusAbsen.IZIN) result.Izin++;
      if (status === StatusAbsen.LIBUR) result.Libur++;

      // Flags (Independent of status)
      if (s) {
        if (s.terlambat) result.Terlambat++;
        if (s.pulang_cepat) result.Pulang_Cepat++;
        if ((s.durasi_lembur ?? 0) > 0) {
          result.Lembur++;
        }
      }
    }

    return result;
  }
}
