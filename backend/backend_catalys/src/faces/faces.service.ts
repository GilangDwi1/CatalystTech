import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FacesService {
  constructor(
    private prisma: PrismaService,
    private http: HttpService,
  ) {}

  // 1️⃣ Upload foto
  async uploadFace(id_karyawan: number, filename: string) {
    const count = await this.prisma.karyawanFace.count({
      where: { id_karyawan },
    });

    if (count >= 5) {
      throw new BadRequestException('Foto sudah lengkap (5 foto)');
    }

    return await this.prisma.karyawanFace.create({
      data: {
        id_karyawan,
        foto_url: `/uploads/faces/${filename}`,
      },
    });
  }

  // 2️⃣ Cek status foto
  async checkFaces(id_karyawan: number) {
    const count = await this.prisma.karyawanFace.count({
      where: { id_karyawan },
    });

    return {
      id_karyawan,
      total_foto: count,
      lengkap: count >= 5,
    };
  }

  // 3️⃣ Generate embedding
  async generateEmbedding(id_karyawan: number) {
    const faces = await this.prisma.karyawanFace.findMany({
      where: { id_karyawan },
    });

    if (faces.length < 5) {
      throw new BadRequestException(
        'Minimal 5 foto diperlukan untuk generate embedding',
      );
    }

    // Kirim ke FASTAPI
    const response = await firstValueFrom(
      this.http.post('http://localhost:5000/generate-embedding', {
        id_karyawan,
        foto_urls: faces.map((f) => f.foto_url),
      }),
    );

    const embedding = response.data.embedding;

    // Simpan embedding
    await this.prisma.faceEmbedding.upsert({
      where: { id_karyawan },
      update: { embedding },
      create: { id_karyawan, embedding },
    });

    return {
      success: true,
      message: 'Embedding berhasil digenerate & disimpan',
    };
  }

  // 4️⃣ Hapus foto & embedding
  async clearFaces(id_karyawan: number) {
    await this.prisma.faceEmbedding.deleteMany({ where: { id_karyawan } });
    await this.prisma.karyawanFace.deleteMany({ where: { id_karyawan } });

    return {
      id_karyawan,
      message: 'Semua foto & embedding direset',
    };
  }

  // 5️⃣ Update 1 foto wajah
  async updateFace(faceId: number, filename: string) {
    const face = await this.prisma.karyawanFace.findUnique({
      where: { id: faceId },
    });

    if (!face) {
      throw new NotFoundException('Data foto tidak ditemukan');
    }

    return this.prisma.karyawanFace.update({
      where: { id: faceId },
      data: {
        foto_url: `/uploads/faces/${filename}`,
      },
    });
  }
}
