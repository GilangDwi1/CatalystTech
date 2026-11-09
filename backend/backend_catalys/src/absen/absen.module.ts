import { Module } from '@nestjs/common';
import { AbsenService } from './absen.service';
import { AbsenController } from './absen.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { CronService } from 'src/common/cron/cron.service';

@Module({
  controllers: [AbsenController],
  providers: [AbsenService, PrismaService, CronService],
  exports: [AbsenService],
})
export class AbsenModule {}
