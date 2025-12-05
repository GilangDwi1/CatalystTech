import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { KaryawanService } from './karyawan.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerAvatarConfig } from 'src/common/upload/multer.config';

@Controller('karyawan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KaryawanController {
  constructor(private readonly karyawanService: KaryawanService) {}

  @Get()
  @Roles('admin', 'HRD', 'kadiv')
  findAll(
    @Query('search') search?: string,
    @Query('divisiId') divisiId?: string,
    @Query('gradeId') gradeId?: string,
    @Query('is_active') is_active?: string,
  ) {
    return this.karyawanService.findAll({
      search,
      divisiId: divisiId ? Number(divisiId) : undefined,
      gradeId: gradeId ? Number(gradeId) : undefined,
      is_active:
        is_active === 'true'
          ? 'true'
          : is_active === 'false'
            ? 'false'
            : undefined,
    });
  }

  @Get(':id')
  @Roles('admin', 'HRD', 'kadiv')
  findOne(@Param('id') id: string) {
    return this.karyawanService.findOne(+id);
  }

  @Post()
  @Roles('admin', 'HRD')
  @UseInterceptors(FileInterceptor('avatar', multerAvatarConfig))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createKaryawanDto: any,
  ) {
    return this.karyawanService.create(createKaryawanDto, file);
  }

  @Put(':id')
  @Roles('admin', 'HRD')
  update(@Param('id') id: string, @Body() updateKaryawanDto: any) {
    console.log(`Updating Karyawan with ID: ${id}`);
    return this.karyawanService.update(+id, updateKaryawanDto);
  }

  @Delete(':id')
  @Roles('admin', 'HRD')
  remove(@Param('id') id: string) {
    return this.karyawanService.remove(+id);
  }

  @Put(':id/nonaktif')
  @Roles('HRD')
  nonaktifkan(@Param('id') id: string) {
    return this.karyawanService.nonaktifkan(+id);
  }
}
