import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIzinDto } from './dto/create-perizinan.dto';

@Injectable()
export class IzinService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateIzinDto, userId: number) {
    const mulai = new Date(dto.tanggal_mulai);
    const selesai = new Date(dto.tanggal_selesai);

    if (mulai > selesai) {
      throw new BadRequestException(
        'Tanggal mulai tidak boleh lebih besar dari tanggal selesai',
      );
    }

    // Simpan izin
    return this.prisma.izin.create({
      data: {
        id_karyawan: Number(dto.id_karyawan),
        jenis: dto.jenis,
        tanggal_mulai: new Date(dto.tanggal_mulai),
        tanggal_selesai: new Date(dto.tanggal_selesai),
        alasan: dto.alasan,
        lampiran: dto.lampiran ?? null,
        dibuat_oleh: userId,
      },
      include: {
        karyawan: true,
        pembuat: true,
      },
    });
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
}
