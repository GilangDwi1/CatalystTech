import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AbsensiConfigService } from './absensi-config.service';
import { AbsensiConfigController } from './absensi-config.controller';

@Module({
  controllers: [AbsensiConfigController],
  providers: [AbsensiConfigService, PrismaService],
})
export class AbsensiConfigModule {}
