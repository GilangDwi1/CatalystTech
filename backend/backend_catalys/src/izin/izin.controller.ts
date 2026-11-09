import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Delete,
  Patch,
  Param,
} from '@nestjs/common';
import { IzinService } from './izin.service';
import { CreateIzinDto } from './dto/create-perizinan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('izin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IzinController {
  constructor(private readonly izinService: IzinService) {}

  @Post()
  @Roles('HRD')
  @UseInterceptors(
    FileInterceptor('lampiran', {
      storage: diskStorage({
        destination: './uploads/izin',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  async create(
    @Body() dto: CreateIzinDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const userId = req.user.userId;

    dto.lampiran = file ? file.filename : undefined;

    return this.izinService.create(dto, userId);
  }

  @Get()
  @Roles('HRD', 'admin', 'Kadiv')
  async findAll() {
    return this.izinService.findAll();
  }

  @Get(':id')
  @Roles('HRD', 'admin', 'Kadiv')
  async findOne(@Param('id') id: number) {
    return this.izinService.findOne(+id);
  }

  @Patch(':id')
  @Roles('HRD')
  @UseInterceptors(
    FileInterceptor('lampiran', {
      storage: diskStorage({
        destination: './uploads/izin',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  
  async update(
    @Param('id') id: number,
    @Body() dto: Partial<CreateIzinDto>,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const lampiran = file ? file.filename : undefined;
    return this.izinService.update(+id, dto, lampiran);
  }

  @Delete(':id/delete')
  @Roles('HRD')
  remove(@Param('id') id: string) {
    return this.izinService.remove(+id);
  }
}
