import { Module } from '@nestjs/common';
import { AbsenService } from './absen.service';
import { AbsenController } from './absen.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [AbsenController],
  providers: [AbsenService, PrismaService],
})
export class AbsenModule {}
