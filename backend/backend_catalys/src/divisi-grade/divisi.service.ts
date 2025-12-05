import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DivisiService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const divisi = await this.prisma.divisi.findMany({
      include: {
        karyawan: {
          where: { is_active: true },
          select: { id: true },
        },
      },
    });

    return divisi.map((d) => ({
      ...d,
      activeKaryawanCount: d.karyawan.length,
    }));

  }

  async findOne(id: number) {
    const divisi = await this.prisma.divisi.findUnique({
      where: { id },
      include: {
        karyawan: {
          include: {
            divisi: true,
            grade: true,
          },
        },
      },
    });

    if (!divisi) {
      throw new NotFoundException(`Divisi dengan ID ${id} tidak ditemukan`);
    }

    return divisi;
  }

  async create(data: any) {
    return this.prisma.divisi.create({
      data : {
        nama_divisi: data.nama_divisi,
      },
    });
  }

  async update(id: number, data: any) {
    try {
      return await this.prisma.divisi.update({
        where: { id },
        data : {
          nama_divisi: data.nama_divisi,
        },
      });
    } catch (error) {
      throw new NotFoundException(`Divisi dengan ID ${id} tidak ditemukan`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.divisi.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Divisi dengan ID ${id} tidak ditemukan`);
    }
  }
}