import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AbsenService } from './absen.service';
import { CreateAbsenDto } from './dto/create-absen.dto';
import { FilterAbsenDto } from './dto/filter-absen.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('absen')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AbsenController {
  constructor(private readonly absenService: AbsenService) {}

  @Post()
  @Roles('HRD',)
  create(@Body() dto: CreateAbsenDto) {
    return this.absenService.create(dto);
  }

  @Get()
  @Roles('admin', 'HRD', 'Kadiv') 
  findAll(@Query() query: FilterAbsenDto) {
    return this.absenService.findAll(query);
  }

  @Get(':id')
  @Roles('admin', 'HRD', 'Kadiv') 
  findOne(@Param('id') id: string) {
    return this.absenService.findOne(Number(id));
  }

  @Get('by-config/:id')
  @Roles('admin', 'HRD', 'Kadiv') 
  findByConfig(@Param('id') id: string) {
    return this.absenService.findByConfig(Number(id));
  }
}
