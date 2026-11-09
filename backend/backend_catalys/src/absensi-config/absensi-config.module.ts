import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AbsensiConfigService } from './absensi-config.service';
import { AbsenModule } from '../absen/absen.module';
import { AbsensiConfigController } from './absensi-config.controller';

@Module({
  imports: [AbsenModule],
  controllers: [AbsensiConfigController],
  providers: [AbsensiConfigService, PrismaService],
})
export class AbsensiConfigModule {}
