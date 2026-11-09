import { Module } from '@nestjs/common';
import { IzinService } from './izin.service';
import { IzinController } from './izin.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AbsenModule } from '../absen/absen.module';

@Module({
  imports: [AbsenModule],
  controllers: [IzinController],
  providers: [IzinService, PrismaService],
})
export class IzinModule {}
