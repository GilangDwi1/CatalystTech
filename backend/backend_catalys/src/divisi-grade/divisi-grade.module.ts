import { Module } from '@nestjs/common';
import { DivisiController } from './divisi.controller';
import { GradeController } from './grade.controller';
import { DivisiService } from './divisi.service';
import { GradeService } from './grade.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DivisiController, GradeController],
  providers: [DivisiService, GradeService],
  exports: [DivisiService, GradeService],
})
export class DivisiGradeModule {}