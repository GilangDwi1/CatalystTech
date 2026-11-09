import { Controller, Post, Get, Delete, Param } from '@nestjs/common';
import { FaceEmbeddingService } from './face-embedding.service';

@Controller('face-embedding')
export class FaceEmbeddingController {
  constructor(private service: FaceEmbeddingService) {}

  // 1. Generate / update embedding dari Flask
  @Post('generate/:id')
  async generate(@Param('id') id: string) {
    return this.service.generateEmbedding(Number(id));
  }

  // 2. Ambil embedding
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.service.getEmbedding(Number(id));
  }

  // 3. Hapus embedding
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.service.deleteEmbedding(Number(id));
  }
}
