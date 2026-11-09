import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DivisiService } from './divisi.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('divisi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DivisiController {
  constructor(private readonly divisiService: DivisiService) {}

  @Get()
  findAll() {
    return this.divisiService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.divisiService.findOne(+id);
  }

  @Post()
  @Roles('admin', 'HRD')
  create(@Body() createDivisiDto: any) {
    return this.divisiService.create(createDivisiDto);
  }

  @Put(':id')
  @Roles('admin', 'HRD')
  update(@Param('id') id: string, @Body() updateDivisiDto: any) {
    return this.divisiService.update(+id, updateDivisiDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.divisiService.remove(+id);
  }
}