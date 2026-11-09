import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLemburConfigDto } from './dto/create-lembur-config.dto';
import { UpdateLemburConfigDto } from './dto/update-lembur-config.dto';
import { count } from 'console';

@Injectable()
export class LemburConfigService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLemburConfigDto) {
    const tanggal = new Date(dto.tanggal);

    const jamMulai = new Date(`${dto.tanggal}T${dto.jam_mulai}:00`);
    const jamSelesai = new Date(`${dto.tanggal}T${dto.jam_selesai}:00`);

    if (jamSelesai <= jamMulai) {
      throw new BadRequestException(
        'Jam selesai harus lebih besar dari jam mulai',
      );
    }

    // cegah duplikat tanggal
    const exists = await this.prisma.configLembur.findFirst({
      where: { tanggal: new Date(dto.tanggal) },
    });

    if (exists) {
      throw new BadRequestException(
        'Config lembur untuk tanggal ini sudah ada',
      );
    }

    return this.prisma.configLembur.create({
      data: {
        tanggal,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
      },
    });
  }

  async findAll() {
    const data = await this.prisma.configLembur.findMany({
      orderBy: { tanggal: 'desc' },
      include: {
        _count: {
          select: {
            lembur: true, // jumlah karyawan lembur
          },
        },
      },
    });

    return data.map((item) => {
      const mulai = new Date(item.jam_mulai);
      const selesai = new Date(item.jam_selesai);

      const durasi_menit = Math.floor(
        (selesai.getTime() - mulai.getTime()) / 60000,
      );

      return {
        ...item,
        durasi_menit,
        durasi_jam: +(durasi_menit / 60).toFixed(2),
        summary: item._count.lembur, // 👈 jumlah karyawan lembur
        _count: undefined, // optional: biar bersih di response
      };
    });
  }

  async findOne(id: number) {
    const data = await this.prisma.configLembur.findUnique({
      where: { id },
    });

    if (!data) {
      throw new NotFoundException('Config lembur tidak ditemukan');
    }

    return data;
  }

  async update(id: number, dto: UpdateLemburConfigDto) {
    const existing = await this.findOne(id);

    const jamMulai = dto.jam_mulai
      ? new Date(dto.jam_mulai)
      : existing.jam_mulai;

    const jamSelesai = dto.jam_selesai
      ? new Date(dto.jam_selesai)
      : existing.jam_selesai;

    if (jamSelesai <= jamMulai) {
      throw new BadRequestException(
        'Jam selesai harus lebih besar dari jam mulai',
      );
    }

    if (dto.tanggal) {
      const duplicate = await this.prisma.configLembur.findFirst({
        where: {
          tanggal: new Date(dto.tanggal),
          NOT: { id },
        },
      });

      if (duplicate) {
        throw new BadRequestException(
          'Config lembur dengan tanggal ini sudah ada',
        );
      }
    }

    return this.prisma.configLembur.update({
      where: { id },
      data: {
        tanggal: dto.tanggal ? new Date(dto.tanggal) : undefined,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.configLembur.delete({
      where: { id },
    });
  }
}
