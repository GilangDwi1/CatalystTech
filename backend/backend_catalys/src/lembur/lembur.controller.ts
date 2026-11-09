import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Patch,
} from '@nestjs/common';
import { LemburService } from './lembur.service';
import { CreateLemburDto } from './dto/create-lembur.dto';
import { BulkCreateLemburDto } from './dto/bulk-create-lembur.dto';
import { UpdateLemburDto } from './dto/update-lembur.dto';

@Controller('lembur')
export class LemburController {
  constructor(private readonly lemburService: LemburService) {}

  @Post()
  create(@Body() dto: CreateLemburDto) {
    return this.lemburService.create(dto);
  }

  @Post('bulk')
  bulkCreate(@Body() dto: BulkCreateLemburDto) {
    return this.lemburService.bulkCreate(dto);
  }

  @Get()
  findAll() {
    return this.lemburService.findAll();
  }

  @Get('config/:id')
  findByConfig(@Param('id') id: string) {
    return this.lemburService.findByConfig(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLemburDto) {
    return this.lemburService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lemburService.remove(Number(id));
  }
}
