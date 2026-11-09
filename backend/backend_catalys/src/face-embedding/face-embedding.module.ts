import { Module } from '@nestjs/common';
import { FaceEmbeddingService } from './face-embedding.service';
import { FaceEmbeddingController } from './face-embedding.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [FaceEmbeddingController],
  providers: [FaceEmbeddingService, PrismaService],
  exports: [FaceEmbeddingService],
})
export class FaceEmbeddingModule {}
