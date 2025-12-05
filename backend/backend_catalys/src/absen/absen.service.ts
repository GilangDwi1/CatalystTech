import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAbsenDto } from './dto/create-absen.dto';
import { FilterAbsenDto } from './dto/filter-absen.dto';
import { JenisAbsen, StatusAbsen } from '@prisma/client';

@Injectable()
export class AbsenService {
  constructor(private prisma: PrismaService) {}

  // 🔥 CREATE ABSEN (dengan mengambil config aktif)
  // absen.service.ts
  async create(dto: CreateAbsenDto) {
    if (!dto.id_karyawan) {
      throw new BadRequestException('id_karyawan wajib diisi');
    }

    // Pakai waktu server
    const waktu = new Date();

    // Tentukan awal & akhir hari
    const start = new Date(waktu);
    start.setHours(0, 0, 0, 0);

    const end = new Date(waktu);
    end.setHours(23, 59, 59, 999);

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
    const now = waktu;
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

    // =============================
    // 1️⃣ Cek apakah ada absen otomatis (izin)
    // =============================
    const existing = await this.prisma.absen.findFirst({
      where: {
        id_karyawan: dto.id_karyawan,
        id_config: config.id,
      },
    });

    // =============================
    // 2️⃣ Jika sudah ada → UPDATE (replace auto-izin)
    // =============================
    if (existing) {
      const updated = await this.prisma.absen.update({
        where: { id: existing.id },
        data: {
          waktu,
          jenis,
          status: StatusAbsen.HADIR,
          device_id: dto.device_id || 'CAMERA',
          lokasi: dto.lokasi || null,
          keterangan: dto.keterangan || null,
        },
        include: { karyawan: true },
      });
      console.log('Absensi diperbarui:', updated);
      return {
        message: 'Absensi berhasil diperbarui',
        data: updated,
      };
    }

    // =============================
    // 3️⃣ Jika belum ada → CREATE baru
    // =============================
    const created = await this.prisma.absen.create({
      data: {
        id_karyawan: dto.id_karyawan,
        id_config: config.id,
        waktu,
        jenis,
        status: StatusAbsen.HADIR,
        device_id: dto.device_id || null,
        lokasi: dto.lokasi || null,
        keterangan: dto.keterangan || null,
      },

      include: { karyawan: true},
    });
    return {
      message: 'Absensi berhasil dicatat',
      data: created,
    };
    
  }

  // 🔍 GET ALL (filter tanggal, divisi, grade)
  async findAll(query: FilterAbsenDto) {
    const where: any = {};

    if (query.tanggal) {
      where.waktu = {
        gte: new Date(query.tanggal + ' 00:00:00'),
        lte: new Date(query.tanggal + ' 23:59:59'),
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

  // 🔍 GET BY ID
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
}
