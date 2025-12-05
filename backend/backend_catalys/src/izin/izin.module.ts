import { Module } from '@nestjs/common';
import { IzinService } from './izin.service';
import { IzinController } from './izin.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [IzinController],
  providers: [IzinService, PrismaService],
})
export class IzinModule {}
