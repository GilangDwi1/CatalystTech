import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KaryawanService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: {
    search?: string;
    divisiId?: number; // dari frontend biasanya divisiId
    gradeId?: number; // dari frontend biasanya gradeId
    is_active?: string;
  }) {
    // Map filter frontend ke nama field Prisma
    const id_divisi = filters?.divisiId;
    const id_grade = filters?.gradeId;
    const search = filters?.search;
    const is_active = filters?.is_active;

    return this.prisma.karyawan.findMany({
      where: {
        ...(is_active === 'true' && { is_active: true }),
        ...(is_active === 'false' && { is_active: false }),
        ...(search && {
          OR: [
            { nama: { contains: search } },
            { NIP: { contains: search } },
            { alamat: { contains: search } },
          ],
        }),
        ...(id_divisi && { id_divisi }),
        ...(id_grade && { id_grade }),
      },
      include: {
        divisi: true,
        grade: true,
      },
      orderBy: { nama: 'asc' },
    });
  }

  async findOne(id: number) {
    const karyawan = await this.prisma.karyawan.findUnique({
      where: { id },
      include: { divisi: true, grade: true, absen: true },
    });

    if (!karyawan) {
      throw new NotFoundException(`Karyawan dengan ID ${id} tidak ditemukan`);
    }

    return karyawan;
  }

  async create(data: any, file: Express.Multer.File) {
    // ---------------------------------------------------------
    // 1. Ambil tanggal lahir dan generate NIP
    // ---------------------------------------------------------
    const lahir = new Date(data.tanggal_lahir);

    const formatDate = lahir.toISOString().slice(0, 10).replace(/-/g, ''); // 19990421

    const random5 = Math.floor(10000 + Math.random() * 90000); // 5 digit

    const generatedNIP = `${formatDate}${random5}`;

    // ---------------------------------------------------------
    // 2. Siapkan data untuk create
    // ---------------------------------------------------------
    const createData = {
      NIP: generatedNIP,
      NIK: data.NIK,
      nama: data.nama,
      alamat: data.alamat,
      tanggal_lahir: new Date(data.tanggal_lahir),
      id_divisi: Number(data.id_divisi),
      id_grade: Number(data.id_grade),
      foto: file ? file.filename : null,
    };

    // ---------------------------------------------------------
    // 3. Simpan ke database
    // ---------------------------------------------------------
    return this.prisma.karyawan.create({
      data: createData,
      include: {
        divisi: true,
        grade: true,
      },
    });
  }

  async update(id: number, data: any) {
    // cek apakah karyawan ada
    const existing = await this.prisma.karyawan.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Karyawan dengan ID ${id} tidak ditemukan`);
    }

    console.log('Data diterima untuk update:', data);

    // Update data
    return this.prisma.karyawan.update({
      where: { id },
      data: {
        NIP: data.NIP,
        nama: data.nama,
        alamat: data.alamat,
        id_divisi: Number(data.id_divisi),
        id_grade: Number(data.id_grade),
        foto: data.foto ?? existing.foto,
      },
      include: {
        divisi: true,
        grade: true,
      },
    });
  }

  async remove(id: number) {
    try {
      return await this.prisma.karyawan.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException(`Karyawan dengan ID ${id} tidak ditemukan`);
    }
  }

  async nonaktifkan(id: number) {
    // Pastikan karyawannya ada
    const karyawan = await this.prisma.karyawan.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!karyawan) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    // Jika sedang AKTIF → NONAKTIFKAN
    if (karyawan.is_active === true) {
      await this.prisma.karyawan.update({
        where: { id },
        data: { is_active: false },
      });

      if (karyawan.user) {
        await this.prisma.user.update({
          where: { id: karyawan.user.id },
          data: { is_active: false },
        });
      }

      return { message: 'Karyawan dan user berhasil dinonaktifkan' };
    }

    // Jika sedang NONAKTIF → AKTIFKAN
    else {
      await this.prisma.karyawan.update({
        where: { id },
        data: { is_active: true },
      });

      if (karyawan.user) {
        await this.prisma.user.update({
          where: { id: karyawan.user.id },
          data: { is_active: true },
        });
      }

      return { message: 'Karyawan dan user berhasil diaktifkan' };
    }
  }
}
