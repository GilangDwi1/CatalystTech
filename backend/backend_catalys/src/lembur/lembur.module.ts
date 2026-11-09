import { Module } from '@nestjs/common';
import { LemburService } from './lembur.service';
import { LemburController } from './lembur.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AbsenModule } from '../absen/absen.module';

@Module({
  imports: [PrismaModule, AbsenModule],
  controllers: [LemburController],
  providers: [LemburService],
})
export class LemburModule {}
