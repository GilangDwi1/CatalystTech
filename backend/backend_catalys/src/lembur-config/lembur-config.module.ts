import { Module } from '@nestjs/common';
import { LemburConfigService } from './lembur-config.service';
import { LemburConfigController } from './lembur-config.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [LemburConfigController],
  providers: [LemburConfigService, PrismaService],
})
export class LemburConfigModule {}
