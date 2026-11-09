import { Module } from '@nestjs/common';
import { FacesService } from './faces.service';
import { FacesController } from './faces.controller';
import { PrismaService } from '../prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [FacesController],
  providers: [FacesService, PrismaService],
})
export class FacesModule {}
