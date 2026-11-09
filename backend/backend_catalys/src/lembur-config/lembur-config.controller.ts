import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LemburConfigService } from './lembur-config.service';
import { CreateLemburConfigDto } from './dto/create-lembur-config.dto';
import { UpdateLemburConfigDto } from './dto/update-lembur-config.dto';

@Controller('lembur-config')
export class LemburConfigController {
  constructor(private readonly service: LemburConfigService) {}

  @Post()
  create(@Body() dto: CreateLemburConfigDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLemburConfigDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
