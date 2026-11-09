import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AbsenService } from './absen.service';
import { CreateAbsenDto } from './dto/create-absen.dto';
import { FilterAbsenDto } from './dto/filter-absen.dto';
import { CreateManualAbsenDto } from './dto/create-manual-absen.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('absen')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AbsenController {
  constructor(private readonly absenService: AbsenService) {}

  @Post()
  @Roles('HRD')
  create(@Body() dto: CreateAbsenDto) {
    return this.absenService.create(dto);
  }

  @Post('manual')
  @Roles('HRD', 'admin')
  manualAbsen(@Body() dto: CreateManualAbsenDto, @Req() req: any) {
    const nipPembuat = req.user?.username || req.user?.NIP || 'Unknown';
    return this.absenService.manualAbsen(dto, nipPembuat);
  }

  @Get()
  @Roles('admin', 'HRD', 'Kadiv')
  findAll(@Query() query: FilterAbsenDto) {
    return this.absenService.findAll(query);
  }

  @Get('filtered/')
  @Roles('admin', 'HRD', 'Kadiv')
  async filtered(
    @Query('id_karyawan') id_karyawan: number,
    @Query('tanggal') tanggal?: string,
  ) {
    return this.absenService.getFilteredAbsensi(id_karyawan, tanggal);
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
