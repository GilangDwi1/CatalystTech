import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AbsensiConfigService } from './absensi-config.service';
import { CreateAbsensiConfigDto } from './dto/create-absensi-config.dto';
import { UpdateAbsensiConfigDto } from './dto/update-absensi-config.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('absensi-config')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AbsensiConfigController {
  constructor(private readonly service: AbsensiConfigService) {}

  @Post()
  @Roles('HRD')
  create(@Body() dto: CreateAbsensiConfigDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles('admin', 'HRD', 'Kadiv')
  findAll() {
    return this.service.findAll();
  }

  @Get('camera-status')
  async cameraStatus(@Query('jenis') jenis: 'DATANG' | 'PULANG') {
    return this.service.checkCameraStatus(jenis);
  }

  @Get(':id')
  @Roles('admin', 'HRD', 'Kadiv')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  @Roles('HRD')
  update(@Param('id') id: string, @Body() dto: UpdateAbsensiConfigDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @Roles('HRD')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
