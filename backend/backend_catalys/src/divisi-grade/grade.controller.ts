import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { GradeService } from './grade.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('grade')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Get()
  findAll() {
    return this.gradeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gradeService.findOne(+id);
  }

  @Post()
  @Roles('admin', 'HRD')
  create(@Body() createGradeDto: any) {
    return this.gradeService.create(createGradeDto);
  }

  @Put(':id')
  @Roles('admin', 'HRD')
  update(@Param('id') id: string, @Body() updateGradeDto: any) {
    return this.gradeService.update(+id, updateGradeDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.gradeService.remove(+id);
  }
}