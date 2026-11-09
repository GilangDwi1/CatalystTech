import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusAbsen } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIzinDto } from './dto/create-perizinan.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { AbsenService } from '../absen/absen.service';

@Injectable()
export class IzinService {
  constructor(private prisma: PrismaService,
              private AbsenService: AbsenService
  ) {}

  async create(dto: CreateIzinDto, userId: number) {
    const mulai = new Date(dto.tanggal_mulai);
    const selesai = new Date(dto.tanggal_selesai);

    if (mulai > selesai) {
      throw new BadRequestException(
        'Tanggal mulai tidak boleh lebih besar dari tanggal selesai',
      );
    }

    // =============================
    // 1️⃣ Simpan izin
    // =============================
    const izin = await this.prisma.izin.create({
      data: {
        id_karyawan: Number(dto.id_karyawan),
        jenis: dto.jenis, // CUTI / SAKIT / IZIN / WFH
        tanggal_mulai: mulai,
        tanggal_selesai: selesai,
        alasan: dto.alasan,
        lampiran: dto.lampiran ?? null,
        dibuat_oleh: userId,
      },
      include: {
        karyawan: true,
        pembuat: true,
      },
    });

    const id_karyawan = Number(dto.id_karyawan);

    // =============================
    // 2️⃣ Generate absen otomatis untuk setiap hari izin
    // =============================
    for (let d = new Date(mulai); d <= selesai; d.setDate(d.getDate() + 1)) {
      const tanggal = new Date(d);

      // Ambil semua config hari itu (DATANG & PULANG)
      const configs = await this.prisma.absensiConfig.findMany({
        where: {
          tanggal: {
            gte: new Date(tanggal.setHours(0, 0, 0, 0)),
            lte: new Date(tanggal.setHours(23, 59, 59, 999)),
          },
        },
      });

      for (const config of configs) {
        const existing = await this.prisma.absen.findFirst({
          where: {
            id_karyawan,
            id_config: config.id,
          },
        });

        if (existing) {
          // ✅ UPDATE HANYA JIKA ALPHA
          if (existing.status === StatusAbsen.ALPHA) {
            await this.prisma.absen.update({
              where: { id: existing.id },
              data: {
                status: StatusAbsen.IZIN,
                keterangan: `Izin otomatis (${dto.jenis})`,
              },
            });
          }
          // ❌ selain ALPHA → DIAMKAN
        } else {
          // ✅ CREATE JIKA BELUM ADA
          await this.prisma.absen.create({
            data: {
              id_karyawan,
              id_config: config.id,
              waktu: config.jam_mulai,
              jenis: config.jenis,
              status: StatusAbsen.IZIN,
              keterangan: `Izin otomatis (${dto.jenis})`,
            },
          });
        }
      }

      // 🔥 Sync sekali saja per hari
      await this.AbsenService.syncAbsenSummary(id_karyawan, tanggal);
    }
    return izin;
  }

  async findAll() {
    return this.prisma.izin.findMany({
      orderBy: { dibuat_pada: 'desc' },
      include: {
        karyawan: {
          include: {
            divisi: true,
            grade: true,
          },
        },
        pembuat: true,
      },
    });
  }

  async findOne(id: number) {
    const izin = await this.prisma.izin.findUnique({
      where: { id },
    });
    if (!izin)
      throw new NotFoundException(`Izin dengan ID ${id} tidak ditemukan`);
    return izin;
  }

  async update(id: number, dto: Partial<CreateIzinDto>, lampiran?: string) {
    const existingIzin = await this.prisma.izin.findUnique({
      where: { id },
    });

    if (!existingIzin) {
      throw new NotFoundException(`Izin dengan ID ${id} tidak ditemukan`);
    }

    // Validasi tanggal jika ada perubahan
    let tanggalMulai = existingIzin.tanggal_mulai;
    let tanggalSelesai = existingIzin.tanggal_selesai;

    if (dto.tanggal_mulai) tanggalMulai = new Date(dto.tanggal_mulai);
    if (dto.tanggal_selesai) tanggalSelesai = new Date(dto.tanggal_selesai);

    if (tanggalMulai > tanggalSelesai) {
      throw new BadRequestException(
        'Tanggal mulai tidak boleh lebih besar dari tanggal selesai',
      );
    }

    const updateData: any = {
      jenis: dto.jenis,
      alasan: dto.alasan,
      tanggal_mulai: dto.tanggal_mulai
        ? new Date(dto.tanggal_mulai)
        : undefined,
      tanggal_selesai: dto.tanggal_selesai
        ? new Date(dto.tanggal_selesai)
        : undefined,
    };

    if (dto.id_karyawan) updateData.id_karyawan = Number(dto.id_karyawan);
    if (lampiran) updateData.lampiran = lampiran;

    return this.prisma.izin.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    // 1. ambil data izin dulu
    const izin = await this.prisma.izin.findUnique({
      where: { id },
    });

    if (!izin) {
      throw new NotFoundException(`Izin dengan ID ${id} tidak ditemukan`);
    }

    // 2. hapus file jika ada
    if (izin.lampiran) {
      const filePath = join(process.cwd(), 'uploads', 'izin', izin.lampiran);

      try {
        await unlink(filePath);
      } catch (err) {
        // file sudah tidak ada → abaikan
        console.warn('File tidak ditemukan:', izin.lampiran);
      }
    }

    // 3. hapus data DB
    return this.prisma.izin.delete({
      where: { id },
    });
  }
}
