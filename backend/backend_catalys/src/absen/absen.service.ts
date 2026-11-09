import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAbsenDto } from './dto/create-absen.dto';
import { FilterAbsenDto } from './dto/filter-absen.dto';
import { JenisAbsen, StatusAbsen } from '@prisma/client';
import { CreateManualAbsenDto } from './dto/create-manual-absen.dto';
import { startOfDay, endOfDay, isAfter, isBefore, parseISO } from 'date-fns';

@Injectable()
export class AbsenService {
  constructor(private readonly prisma: PrismaService) {}

  // 🔥 CREATE ABSEN
  async create(dto: CreateAbsenDto) {

    if (!dto.id_karyawan) {
      throw new BadRequestException('id_karyawan wajib diisi');
    }
    console.log('Menerima request absensi untuk karyawan ID:', dto.id_karyawan);

    const karyawan = await this.prisma.karyawan.findUnique({
      where: { NIP: dto.id_karyawan },
    });

    if (!karyawan) {
      throw new BadRequestException('Karyawan tidak ditemukan.');
    }

    if (!karyawan.is_active) {
      throw new BadRequestException(
        'Karyawan tidak aktif dan tidak boleh melakukan absensi.',
      );
    }

    const now = new Date();
    const start = startOfDay(now);
    const end = endOfDay(now);

    // 1. MEMULAI PENGECEKAN CONFIG ABSENSI
    // Ambil semua config hari ini
    const configs = await this.prisma.absensiConfig.findMany({
      where: {
        tanggal: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { jam_mulai: 'asc' },
    });

    if (!configs.length) {
      throw new BadRequestException('Tidak ada config absensi untuk hari ini.');
    }

    // Pilih config yang jamnya cocok dengan jam sekarang
    const config = configs.find((c) => {
      const mulai = new Date(c.jam_mulai);
      const selesai = new Date(c.jam_selesai);
      return now >= mulai && now <= selesai;
    });

    if (!config) {
      throw new BadRequestException(
        'Tidak ada absensi yang aktif pada jam ini.',
      );
    }

    const jenis = config.jenis;
    const id = Number(karyawan.id);

    // =============================
    // 1️⃣ Cek Perizinan
    // =============================
    const izin = await this.prisma.izin.findFirst({
      where: {
        id_karyawan: id,
        tanggal_mulai: { lte: end },
        tanggal_selesai: { gte: start },
      },
    });

    if (izin) {
      throw new BadRequestException(
        'Anda sedang izin, silahkan menghubungi HRD',
      );
    }

    // =============================
    // 2️⃣ Cek Existing Absen
    // =============================
    const existing = await this.prisma.absen.findFirst({
      where: {
        id_karyawan: id,
        id_config: config.id,
      },
    });

    let statusAbsen: StatusAbsen = StatusAbsen.HADIR;

    // =============================
    // 3️⃣ Cek Jenis Absen & Logika Sederhana (Detail di Sync)
    // =============================
    if (jenis === JenisAbsen.PULANG) {
      // Cek Lembur
      // Logika Lembur shifted ke Sync Summary untuk penentuan final
      // Di sini hanya cek validasi dasar
      const lembur = await this.prisma.lembur.findFirst({
        where: {
          id_karyawan: id,
          dibuat_pada: { gte: start, lte: end },
        },
      });

      if (lembur) {
        const lemburSelesai = new Date(lembur.jam_selesai);
        if (now < lemburSelesai) {
          // throw new BadRequestException('Anda sedang dalam shift lembur');
          // User logic: "Hadir + lembur" -> Status: HADIR, Flag: lembur
          // Jadi boleh absen pulang, nanti di summary dihitung
        }
      }
    } else if (jenis === JenisAbsen.DATANG) {
      if ((config as any).batas_absen) {
        const batas = new Date((config as any).batas_absen);
        if (now > batas) {
          statusAbsen = StatusAbsen.TERLAMBAT; // Ini status sementara di table Absen, final di Summary
        }
      }
    }

    // =============================
    // 4️⃣ Execute Transaction (Upsert logic)
    // =============================
    let absenResult;
    try {
      if (existing) {
        absenResult = await this.prisma.absen.update({
          where: { id: existing.id },
          data: {
            waktu: now,
            jenis,
            status: statusAbsen,
            device_id: dto.device_id || 'CAMERA',
            lokasi: dto.lokasi || null,
            keterangan: dto.keterangan || null,
          },
          include: { karyawan: true },
        });
      } else {
        absenResult = await this.prisma.absen.create({
          data: {
            id_karyawan: id,
            id_config: config.id,
            waktu: now,
            jenis,
            status: statusAbsen,
            device_id: dto.device_id || null,
            lokasi: dto.lokasi || null,
            keterangan: dto.keterangan || null,
          },
          include: { karyawan: true },
        });
      }
    } catch (error) {
      if (error.code === 'P2002') {
        // Race condition handle
        throw new BadRequestException('Absensi sudah tercatat.');
      }
      throw error;
    }

    // =============================
    // 5️⃣ Sync summary (REALTIME)
    // =============================
    await this.syncAbsenSummary(id, now);

    return {
      message: existing
        ? 'Absensi berhasil diperbarui'
        : 'Absensi berhasil dicatat',
      data: absenResult,
      jenis: config.jenis,
    };
  }

  async findAll(query: FilterAbsenDto) {
    const where: any = {};
    if (query.tanggal) {
      const tgl = new Date(query.tanggal);
      where.waktu = {
        gte: startOfDay(tgl),
        lte: endOfDay(tgl),
      };
    }

    if (query.divisiId || query.gradeId) {
      where.karyawan = {
        id_divisi: query.divisiId ? Number(query.divisiId) : undefined,
        id_grade: query.gradeId ? Number(query.gradeId) : undefined,
      };
    }

    return this.prisma.absen.findMany({
      where,
      include: {
        karyawan: { include: { divisi: true, grade: true } },
        config: true,
      },
      orderBy: { waktu: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.absen.findUnique({
      where: { id },
      include: {
        karyawan: { include: { divisi: true, grade: true } },
        config: true,
      },
    });
  }

  async findByConfig(id_config: number) {
    return this.prisma.absen.findMany({
      where: { id_config },
      include: {
        karyawan: { include: { divisi: true, grade: true } },
        config: true,
      },
      orderBy: { waktu: 'asc' },
    });
  }

  async getFilteredAbsensi(id_karyawan: number, tanggal?: string) {
    // Basic implementation wrapper around Sync/Summary table
    // Idealnya return data dari table AbsenSummary directly
    const where: any = { id_karyawan: Number(id_karyawan) };

    if (tanggal && tanggal !== 'null' && tanggal !== 'undefined') {
      const tgl = parseISO(tanggal); // date-fns
      where.tanggal = {
        gte: startOfDay(tgl),
        lte: endOfDay(tgl),
      };
    }

    const summaries = await this.prisma.absenSummary.findMany({
      where,
      orderBy: { tanggal: 'asc' },
      include: { karyawan: { include: { divisi: true, grade: true } } },
    });

    // Fallback if emptiness
    if (!summaries.length && tanggal) {
      // Return dummy/empty state?
      return [];
    }

    return summaries;
  }

  async manualAbsen(dto: CreateManualAbsenDto, nipPembuat: string) {
    if (!dto.id_karyawan || !dto.waktu || !dto.jenis) {
      throw new BadRequestException(
        'id_karyawan, waktu, dan jenis wajib diisi',
      );
    }

    const waktu = new Date(dto.waktu);
    if (isNaN(waktu.getTime())) {
      throw new BadRequestException('Format waktu tidak valid');
    }

    const start = startOfDay(waktu);
    const end = endOfDay(waktu);

    const config = await this.prisma.absensiConfig.findFirst({
      where: {
        jenis: dto.jenis,
        tanggal: { gte: start, lte: end },
      },
    });

    if (!config) {
      throw new BadRequestException(
        'Tidak ada config absensi untuk tanggal tersebut.',
      );
    }

    // 🔍 Cari absen existing (biasanya auto-ALPHA)
    const existing = await this.prisma.absen.findFirst({
      where: {
        id_karyawan: dto.id_karyawan,
        jenis: dto.jenis,
      },
    });

    const status =
      StatusAbsen[dto.status as keyof typeof StatusAbsen] ?? StatusAbsen.HADIR;

    let result;

    if (existing) {
      // 🔥 UPDATE ALPHA → HADIR (atau status lain)
      result = await this.prisma.absen.update({
        where: { id: existing.id },
        data: {
          waktu,
          status,
          device_id: 'MANUAL',
          keterangan: `Manual by ${nipPembuat} ${dto.keterangan || ''}`,
        },
        include: { karyawan: true, config: true },
      });
    } else {
      // ➕ CREATE baru (belum pernah ada)
      result = await this.prisma.absen.create({
        data: {
          id_karyawan: dto.id_karyawan,
          id_config: config.id,
          waktu,
          jenis: dto.jenis,
          status,
          device_id: 'MANUAL',
          keterangan: `Manual by ${nipPembuat} ${dto.keterangan || ''}`,
        },
        include: { karyawan: true, config: true },
      });
    }

    // 🔁 SYNC SUMMARY (WAJIB)
    await this.syncAbsenSummary(dto.id_karyawan, waktu);

    return {
      message: 'Absensi manual berhasil dicatat',
      data: result,
    };
  }

  async generateAlphaForFinishedConfigs() {
    const now = new Date();
    // Cari config yg sudah selesai hari ini
    const configs = await this.prisma.absensiConfig.findMany({
      where: {
        jam_selesai: { lt: now },
        alpha_generated: false,
        jenis: { in: [JenisAbsen.DATANG, JenisAbsen.PULANG] },
      },
    });

    for (const config of configs) {
      const karyawanAktif = await this.prisma.karyawan.findMany({
        where: { is_active: true },
      });

      // Cek absen existing di config ini
      const existingAbsen = await this.prisma.absen.findMany({
        where: { id_config: config.id },
        select: { id_karyawan: true },
      });
      const visited = new Set(existingAbsen.map((a) => a.id_karyawan));

      // Yang belum absen
      const alphaCandidates = karyawanAktif.filter((k) => !visited.has(k.id));

      for (const k of alphaCandidates) {
        // Kita tidak perlu insert row 'Absen' dengan status ALPHA jika kita menggunakan Summary Table
        // Tapi untuk konsistensi historical log, boleh insert.
        // Namun logic table bilang: "Tidak datang -> ALPHA" handled by Sync.

        // Trigger sync
        await this.syncAbsenSummary(k.id, config.tanggal);
      }

      await this.prisma.absensiConfig.update({
        where: { id: config.id },
        data: { alpha_generated: true },
      });
    }
  }

  // ==========================================
  // CORE LOGIC: SYNC DAILY SUMMARY
  // ==========================================
  public async syncAbsenSummary(id_karyawan: number, tanggal: Date) {
    const start = startOfDay(tanggal);
    const end = endOfDay(tanggal);

    // 1. Get Data
    const absens = await this.prisma.absen.findMany({
      where: { id_karyawan, waktu: { gte: start, lte: end } },
    });

    const izin = await this.prisma.izin.findFirst({
      where: {
        id_karyawan,
        tanggal_mulai: { lte: end },
        tanggal_selesai: { gte: start },
      },
    });

    const lembur = await this.prisma.lembur.findFirst({
      where: {
        id_karyawan,
        jam_mulai: { gte: start, lte: end },
      },
    });

    const configDatang = await this.prisma.absensiConfig.findFirst({
      where: { tanggal: { gte: start, lte: end }, jenis: JenisAbsen.DATANG },
    });

    const configPulang = await this.prisma.absensiConfig.findFirst({
      where: { tanggal: { gte: start, lte: end }, jenis: JenisAbsen.PULANG },
    });

    // 2. Extract Records
    const datangRecord = absens.find((a) => a.jenis === JenisAbsen.DATANG);
    const pulangRecord = absens.find((a) => a.jenis === JenisAbsen.PULANG);

    let datangTime =
      datangRecord?.status === StatusAbsen.ALPHA
        ? null
        : (datangRecord?.waktu ?? null);

    let pulangTime =
      pulangRecord?.status === StatusAbsen.ALPHA
        ? null
        : (pulangRecord?.waktu ?? null);

    // 3. Defaults
    let status: StatusAbsen = StatusAbsen.ALPHA;
    let terlambat = false;
    let pulang_cepat = false;
    let durasi_lembur = 0;
    let keterangan = '';

    const isWorkingDay = !!(configDatang || configPulang);

    // ==========================================
    // LOGIC TABLE (FIXED)
    // ==========================================

    if (izin) {
      status = StatusAbsen.IZIN;
      keterangan = `Izin: ${izin.jenis}`;
      // Jika Izin, pastikan waktu kosong (tidak menggenerate waktu)
      datangTime = null;
      pulangTime = null;
    } else if (!isWorkingDay) {
      status = StatusAbsen.LIBUR;
      if (lembur) {
        durasi_lembur = lembur.durasi_menit;
        keterangan = 'Lembur di Hari Libur';
      } else {
        keterangan = 'Libur';
      }
    } else {
      // Hari Kerja
      if (!datangTime) {
        status = StatusAbsen.ALPHA;
        keterangan = 'Tidak Absen Datang';
      } else {
        status = StatusAbsen.HADIR;

        // Terlambat
        if (configDatang?.batas_absen && datangTime) {
          const batasAbsen = new Date(configDatang.batas_absen);

          if (isAfter(datangTime, batasAbsen)) {
            terlambat = true;
            keterangan = 'Terlambat';
          }
        }

        // Pulang
        if (pulangTime && configPulang) {
          const shiftEnd = new Date(configPulang.jam_mulai);
          if (isBefore(pulangTime, shiftEnd)) {
            pulang_cepat = true;
          }
        } else if (!pulangTime) {
          keterangan = 'Belum / Lupa Absen Pulang';
        }

        // LEMBUR hanya kalau HADIR
        if (lembur) {
          durasi_lembur = lembur.durasi_menit;
        }
      }
    }

    // 🔒 FINAL SAFETY NET (INI YANG KAMU MINTA)
    if (status === StatusAbsen.ALPHA || status === StatusAbsen.IZIN) {
      durasi_lembur = 0;
    }

    // 4. Persist
    await this.prisma.absenSummary.upsert({
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
}
