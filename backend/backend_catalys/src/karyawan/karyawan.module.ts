import { Module } from '@nestjs/common';
import { KaryawanController } from './karyawan.controller';
import { KaryawanService } from './karyawan.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [KaryawanController],
  providers: [KaryawanService],
  exports: [KaryawanService],
})
export class KaryawanModule {}