import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAbsensiConfigDto } from './dto/create-absensi-config.dto';
import { UpdateAbsensiConfigDto } from './dto/update-absensi-config.dto';
import { startOfDay, endOfDay, parseISO, addDays } from 'date-fns';
import { StatusAbsen } from "@prisma/client";
import { AbsenService } from '../absen/absen.service';

@Injectable()
export class AbsensiConfigService {
  constructor(
    private prisma: PrismaService,
    private AbsenService: AbsenService,
  ) {}

  async create(dto: CreateAbsensiConfigDto) {
    const { tanggal, jam_mulai, jam_selesai, batas_absen, jenis, dibuat_oleh } =
      dto;

    // =============================
    // 1️⃣ Konversi tanggal & waktu (Using date-fns parsing implicitly/explicitly if needed, currently string constructor is OK if format invalid it throws)
    // =============================
    const tanggalDate = new Date(`${tanggal}T00:00:00`);
    const jamMulaiDate = new Date(`${tanggal}T${jam_mulai}:00`);
    const jamSelesaiDate = new Date(`${tanggal}T${jam_selesai}:00`);
    const batasabsenDate = new Date(`${tanggal}T${batas_absen}:00`);

    // =============================
    // 2️⃣ Validasi tanggal tidak boleh masa lalu
    // =============================
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (tanggalDate < now) {
      throw new BadRequestException('Tanggal tidak boleh di masa lalu');
    }

    // =============================
    // 3️⃣ Validasi jam mulai < jam selesai
    // =============================
    if (jamMulaiDate >= jamSelesaiDate) {
      throw new BadRequestException(
        'Jam mulai harus lebih kecil dari jam selesai',
      );
    }

    // Validasi batas absen harus di antara jam mulai dan jam selesai
    if (batasabsenDate < jamMulaiDate || batasabsenDate > jamSelesaiDate) {
      throw new BadRequestException(
        'Batas absen harus berada di antara jam mulai dan jam selesai',
      );
    }

    // =============================
    // 4️⃣ Cek config tanggal + jenis sudah ada?
    // =============================
    const existing = await this.prisma.absensiConfig.findFirst({
      where: {
        tanggal: {
          gte: startOfDay(tanggalDate),
          lte: endOfDay(tanggalDate),
        },
        jenis,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Config absensi untuk ${jenis} pada tanggal ini sudah dibuat`,
      );
    }

    // =============================
    // 5️⃣ Tidak boleh PULANG tanpa DATANG
    // =============================
    if (jenis === 'PULANG') {
      const datangConfig = await this.prisma.absensiConfig.findFirst({
        where: {
          tanggal: {
            gte: startOfDay(tanggalDate),
            lte: endOfDay(tanggalDate),
          },
          jenis: 'DATANG',
        },
      });

      if (!datangConfig) {
        throw new BadRequestException(
          'Tidak bisa membuat absensi PULANG sebelum DATANG.',
        );
      }
    }

    // =============================
    // 6️⃣ SIMPAN CONFIG
    // =============================
    const config = await this.prisma.absensiConfig.create({
      data: {
        tanggal: tanggalDate,
        jam_mulai: jamMulaiDate,
        jam_selesai: jamSelesaiDate,
        jenis,
        dibuat_oleh,
      },
      include: { user: true },
    });

    // ========================================================
    // 7️⃣ Generate absen otomatis untuk karyawan yang sedang izin
    // ========================================================
    const izinList = await this.prisma.izin.findMany({
      where: {
        tanggal_mulai: { lte: tanggalDate },
        tanggal_selesai: { gte: tanggalDate },
      },
    });

    for (const izin of izinList) {
      // Note: AbsenService.syncAbsenSummary will handle logic,
      // but we might want to ensure 'Izin' record exists in Absen table too for consistency if required.
      // The original code created Absen record:
      await this.prisma.absen.create({
        data: {
          id_karyawan: izin.id_karyawan,
          id_config: config.id,
          waktu: jamMulaiDate,
          jenis: config.jenis,
          status: StatusAbsen.IZIN,
          keterangan: `Izin (${izin.jenis}), ${izin.alasan}`,
        },
      });

      // 🔥 SYNC SUMMARY
      await this.AbsenService.syncAbsenSummary(izin.id_karyawan, tanggalDate);
    }

    return config;
  }

  async findAll() {
    return this.prisma.absensiConfig.findMany({
      include: { user: true },
      orderBy: { tanggal: 'desc' },
    });
  }

  async findOne(id: number) {
    const config = await this.prisma.absensiConfig.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!config)
      throw new NotFoundException(
        `AbsensiConfig dengan ID ${id} tidak ditemukan`,
      );
    return config;
  }

  async update(id: number, dto: UpdateAbsensiConfigDto) {
    await this.findOne(id); // cek dulu
    return this.prisma.absensiConfig.update({
      where: { id },
      data: dto,
      include: { user: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // cek dulu
    return this.prisma.absensiConfig.delete({ where: { id } });
  }

  async halamanKehadiran(tanggal?: string) {
    let configs;

    if (tanggal) {
      // tanggal = "2025-12-07"
      const start = new Date(tanggal + 'T00:00:00.000Z');
      const end = addDays(start, 1); // +1 hari

      configs = await this.prisma.absensiConfig.findMany({
        where: {
          tanggal: {
            gte: start,
            lt: end,
          },
        },
        include: { user: true },
        orderBy: { tanggal: 'desc' },
      });
    } else {
      configs = await this.prisma.absensiConfig.findMany({
        include: { user: true },
        orderBy: { tanggal: 'desc' },
      });
    }

    // lanjut grouping seperti sebelumnya...
    const grouped: Record<string, any> = {};

    configs.forEach((cfg) => {
      const tanggalKey = cfg.tanggal.toISOString().split('T')[0];

      if (!grouped[tanggalKey]) {
        grouped[tanggalKey] = {
          tanggal: cfg.tanggal,
          datang: null,
          pulang: null,
          dibuat_oleh: cfg.user?.NIP ?? cfg.user?.username,
        };
      }

      if (cfg.jenis === 'DATANG') {
        grouped[tanggalKey].datang = {
          config_id: cfg.id,
          jam_mulai: cfg.jam_mulai,
          jam_selesai: cfg.jam_selesai,
        };
      }

      if (cfg.jenis === 'PULANG') {
        grouped[tanggalKey].pulang = {
          config_id: cfg.id,
          jam_mulai: cfg.jam_mulai,
          jam_selesai: cfg.jam_selesai,
        };
      }
    });

    return Object.values(grouped);
  }
  private resolveStatus(
    isWorkingDay: boolean,
    s?: {
      status: StatusAbsen;
      pulang: Date | null;
      durasi_lembur?: number | null;
    },
  ): StatusAbsen {
    if (!isWorkingDay) return StatusAbsen.LIBUR;

    if (!s) return StatusAbsen.ALPHA;

    if (s.status === StatusAbsen.IZIN) return StatusAbsen.IZIN;

    if (s.status === StatusAbsen.ALPHA) return StatusAbsen.ALPHA;

    // if (s.pulang && (s.durasi_lembur ?? 0) > 0) {
    //   return StatusAbsen.LEMBUR;
    // }

    return StatusAbsen.HADIR;
  }
  // =========================================================================
  // 🔥 REFACTOR: GUNAKAN ABSENSUMMARY SEBAGAI SINGLE SOURCE OF TRUTH
  // =========================================================================
  async detailKehadiran(tanggal: string) {
    // 1. Parsing Date
    const start = startOfDay(new Date(tanggal));
    const end = endOfDay(new Date(tanggal));

    // 2. Query Configs (untuk info configs hari ini)
    const configs = await this.prisma.absensiConfig.findMany({
      where: { tanggal: { gte: start, lte: end } },
    });

    // 3. Query Karyawan
    const karyawanList = await this.prisma.karyawan.findMany({
      where: { is_active: true },
      select: { id: true, nama: true },
    });

    // 4. Query AbsenSummary (THE TRUTH)
    // Note: AbsenSummary might not exist for all employees if they haven't been processed.
    // However, logic says sync happens on events or batch jobs.
    // Ideally we assume summary represents current state.
    // But if we want to show "ALPHA" for employees with no data, we might need to fill gaps.
    // Wait, the Logic Table says: "Tidak datang -> ALPHA".
    // If syncAbsenSummary was called for them, they have ALPHA logic.
    // But if no one touched the system?
    // We should rely on what's in database or fill defaults.
    // Let's rely on Summary table. If empty, it means no calculation made yet?
    // Or we can simple Left Join logic here.

    // For simplicity and correctness:
    // We will Map Karyawan -> Summary.
    const summaries = await this.prisma.absenSummary.findMany({
      where: {
        tanggal: { gte: start, lte: end },
      },
      include: { karyawan: true },
    });

    const summaryMap = new Map<number, (typeof summaries)[0]>();
    summaries.forEach((s) => summaryMap.set(s.id_karyawan, s));

    // 5. Map Data
    const isWorkingDay = configs.length > 0;

    const data = karyawanList.map((k) => {
      const s = summaryMap.get(k.id);

      const status = this.resolveStatus(isWorkingDay, s);

      return {
        nama: k.nama,
        datang: s?.datang ?? null,
        pulang: s?.pulang ?? null,
        status,
        lembur_menit: s?.durasi_lembur ?? 0,
        lembur: (s?.durasi_lembur ?? 0) > 0,
        lokasi_datang: null,
        lokasi_pulang: null,
        terlambat: s?.terlambat ?? false,
        pulang_cepat: s?.pulang_cepat ?? false,
        keterangan: s?.keterangan ?? null,
      };
    });

    // 6. Aggregation
    const summary = {
      total: data.length,
      hadir: 0,
      terlambat: 0,
      pulang_cepat: 0,
      alpha: 0,
      izin: 0,
      lembur: 0,
      libur: 0,
    };

    for (const d of data) {
      if (d.status === StatusAbsen.HADIR) summary.hadir++;
      if (d.status === StatusAbsen.ALPHA) summary.alpha++;
      if (d.status === StatusAbsen.IZIN) summary.izin++;
      // if (d.status === StatusAbsen.LEMBUR) summary.lembur++;
      if (d.status === StatusAbsen.LIBUR) summary.libur++;

      // Flags are independent of status HADIR in specific count?
      // Usually "Terlambat" count in dashboard implies how many people were late (even if Present).
      if (d.terlambat) summary.terlambat++;
      if (d.pulang_cepat) summary.pulang_cepat++;
      if (d.lembur) summary.lembur++;
    }

    return {
      tanggal,
      summary,
      data,
    };
  }
}
