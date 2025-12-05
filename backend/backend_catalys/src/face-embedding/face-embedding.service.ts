import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class FaceEmbeddingService {
  constructor(private prisma: PrismaService) {}

  // 1. Generate embedding dari Flask
  async generateEmbedding(id_karyawan: number) {
    // Cek apakah 5 foto tersedia
    const photos = await this.prisma.karyawanFace.findMany({
      where: { id_karyawan },
    });

    if (photos.length < 5) {
      throw new BadRequestException(
        `Foto wajah belum lengkap: ${photos.length}/5`,
      );
    }

    // Kirim ke Flask
    const flaskURL = 'http://localhost:5000/generate-embedding';

    const response = await axios.post(flaskURL, {
      images: photos.map((p) => p.foto_url),
      id_karyawan,
    });

    const embedding = response.data.embedding;
    const source = response.data.model || 'unknown';

    // Simpan ke DB (upsert)
    return this.prisma.faceEmbedding.upsert({
      where: { id_karyawan },
      update: { embedding, source },
      create: { id_karyawan, embedding, source },
    });
  }

  // 2. Get embedding per karyawan
  async getEmbedding(id_karyawan: number) {
    const data = await this.prisma.faceEmbedding.findUnique({
      where: { id_karyawan },
    });

    if (!data) {
      throw new NotFoundException('Embedding belum dibuat.');
    }

    return data;
  }

  // 3. Delete/reset embedding
  async deleteEmbedding(id_karyawan: number) {
    const exists = await this.prisma.faceEmbedding.findUnique({
      where: { id_karyawan },
    });

    if (!exists) {
      throw new NotFoundException('Tidak ada embedding untuk dihapus.');
    }

    return this.prisma.faceEmbedding.delete({
      where: { id_karyawan },
    });
  }
}
