import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAbsensiConfigDto } from './dto/create-absensi-config.dto';
import { UpdateAbsensiConfigDto } from './dto/update-absensi-config.dto';
import { isAfter, isBefore } from 'date-fns';

@Injectable()
export class AbsensiConfigService {
  constructor(private prisma: PrismaService) {}

  async checkCameraStatus(jenis: 'DATANG' | 'PULANG') {
    const today = new Date();

    const config = await this.prisma.absensiConfig.findFirst({
      where: {
        tanggal: {
          gte: new Date(today.setHours(0, 0, 0, 0)),
          lte: new Date(today.setHours(23, 59, 59, 999)),
        },
        jenis,
      },
    });

    if (!config) {
      return {
        status: 'BELUM_DIBUKA',
        message: 'Absen belum dibuat untuk hari ini',
      };
    }

    const now = new Date();
    if (isBefore(now, config.jam_mulai)) {
      return { status: 'BELUM_DIBUKA', message: 'Absen belum dibuka' };
    } else if (isAfter(now, config.jam_selesai)) {
      return { status: 'SUDAH_TUTUP', message: 'Absen sudah ditutup' };
    }

    return { status: 'AKTIF', message: 'Absen aktif, kamera bisa nyala' };
  }

  async create(dto: CreateAbsensiConfigDto) {
  const { tanggal, jam_mulai, jam_selesai, jenis, dibuat_oleh } = dto;

  // =============================
  // 1️⃣ Konversi tanggal & waktu
  // =============================
  const tanggalDate = new Date(`${tanggal}T00:00:00`);
  const jamMulaiDate = new Date(`${tanggal}T${jam_mulai}:00`);
  const jamSelesaiDate = new Date(`${tanggal}T${jam_selesai}:00`);

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
    throw new BadRequestException('Jam mulai harus lebih kecil dari jam selesai');
  }

  // =============================
  // 4️⃣ Cek config tanggal + jenis sudah ada?
  // =============================
  const existing = await this.prisma.absensiConfig.findFirst({
    where: {
      tanggal: {
        gte: new Date(tanggalDate.setHours(0, 0, 0, 0)),
        lte: new Date(tanggalDate.setHours(23, 59, 59, 999)),
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
          gte: new Date(tanggalDate.setHours(0, 0, 0, 0)),
          lte: new Date(tanggalDate.setHours(23, 59, 59, 999)),
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
    await this.prisma.absen.create({
      data: {
        id_karyawan: izin.id_karyawan,
        id_config: config.id,
        waktu: jamMulaiDate,              // masuk otomatis
        jenis: config.jenis,
        status: izin.jenis,               // CUTI / SAKIT / IZIN / WFH
        keterangan: `Auto dari izin (${izin.jenis})`,
      },
    });
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
}
