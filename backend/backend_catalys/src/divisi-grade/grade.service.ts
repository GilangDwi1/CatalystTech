import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GradeService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const grade = await this.prisma.grade.findMany({
      include: {
        karyawan: {
          where: { is_active: true },
          select: { id: true },
        },
      },
    });

    return grade.map((d) => ({
      ...d,
      activeKaryawanCount: d.karyawan.length,
    }));
  }

  async findOne(id: number) {
    return this.prisma.grade.findUnique({
      where: { id: Number(id) },
      include: {
        karyawan: {
          include: {
            divisi: true, // ✅ biar frontend bisa akses k.divisi.nama_divisi
            grade: true, // ✅ kalau kamu mau akses k.grade.grade
          },
        },
      },
    });
  }

  async create(data: any) {
    return this.prisma.grade.create({
      data: {
        grade: data.grade,
      },
    });
  }

  async update(id: number, data: any) {
    try {
      return await this.prisma.grade.update({
        where: { id },
        data: {
          grade: data.grade,
        },
      });
    } catch (error) {
      throw new NotFoundException(`Grade dengan ID ${id} tidak ditemukan`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.grade.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Grade dengan ID ${id} tidak ditemukan`);
    }
  }
}