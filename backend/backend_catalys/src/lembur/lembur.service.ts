import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLemburDto } from './dto/create-lembur.dto';
import { BulkCreateLemburDto } from './dto/bulk-create-lembur.dto';
import { UpdateLemburDto } from './dto/update-lembur.dto';
import { AbsenService } from '../absen/absen.service';

@Injectable()
export class LemburService {
  constructor(
    private prisma: PrismaService,
    private absenService: AbsenService,
  ) {}

  // =============================
  // CREATE SINGLE
  // =============================
  async create(dto: CreateLemburDto) {
    const config = await this.prisma.configLembur.findUnique({
      where: { id: dto.id_config_lembur },
    });

    if (!config) throw new NotFoundException('Config lembur tidak ditemukan');

    const jam_mulai = new Date(config.jam_mulai);
    const jam_selesai = new Date(config.jam_selesai);

    if (jam_selesai <= jam_mulai) {
      throw new BadRequestException('Jam lembur tidak valid');
    }

    const durasi_menit = Math.floor(
      (jam_selesai.getTime() - jam_mulai.getTime()) / 60000,
    );

    const result = await this.prisma.lembur.create({
      data: {
        id_karyawan: dto.id_karyawan,
        id_config_lembur: dto.id_config_lembur,
        jam_mulai,
        jam_selesai,
        durasi_menit,
      },
    });

    // 🔥 SYNC SUMMARY
    await this.absenService.syncAbsenSummary(dto.id_karyawan, jam_mulai);
    return result;
  }

  // =============================
  // BULK CREATE (HRD FRIENDLY)
  // =============================
  async bulkCreate(dto: BulkCreateLemburDto) {
    const config = await this.prisma.configLembur.findUnique({
      where: { id: dto.id_config_lembur },
    });

    if (!config) throw new NotFoundException('Config lembur tidak ditemukan');

    const jam_mulai = new Date(config.jam_mulai);
    const jam_selesai = new Date(config.jam_selesai);

    const durasi_menit = Math.floor(
      (jam_selesai.getTime() - jam_mulai.getTime()) / 60000,
    );

    if (durasi_menit <= 0)
      throw new BadRequestException('Durasi lembur tidak valid');

    const data = dto.id_karyawan_list.map((id_karyawan) => ({
      id_karyawan,
      id_config_lembur: dto.id_config_lembur,
      jam_mulai,
      jam_selesai,
      durasi_menit,
    }));

    const result = await this.prisma.lembur.createMany({
      data,
      skipDuplicates: true, // aman karena unique composite
    });

    // 🔥 SYNC SUMMARY UNTUK SETIAP KARYAWAN
    for (const id_karyawan of dto.id_karyawan_list) {
      await this.absenService.syncAbsenSummary(id_karyawan, jam_mulai);
    }

    return result;
  }

  // =============================
  // FIND ALL
  // =============================
  async findAll() {
    return this.prisma.lembur.findMany({
      include: {
        karyawan: true,
        config: true,
      },
      orderBy: {
        dibuat_pada: 'desc',
      },
    });
  }

  // =============================
  // FIND BY CONFIG
  // =============================
  async findByConfig(id_config_lembur: number) {
    return this.prisma.lembur.findMany({
      where: { id_config_lembur },
      include: {
        karyawan: true,
      },
    });
  }

  // =============================
  // UPDATE
  // =============================
  async update(id: number, dto: UpdateLemburDto) {
    const result = await this.prisma.lembur.update({
      where: { id },
      data: dto,
    });

    // 🔥 SYNC SUMMARY (Update durasi lembur di summary)
    await this.absenService.syncAbsenSummary(
      result.id_karyawan,
      result.jam_mulai,
    );
    return result;
  }

  // =============================
  // DELETE
  // =============================
  async remove(id: number) {
    const result = await this.prisma.lembur.delete({
      where: { id },
    });

    // 🔥 SYNC SUMMARY (Hapus durasi lembur di summary)
    await this.absenService.syncAbsenSummary(
      result.id_karyawan,
      result.jam_mulai,
    );
    return result;
  }
}
