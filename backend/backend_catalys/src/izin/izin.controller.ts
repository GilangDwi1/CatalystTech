import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { IzinService } from './izin.service';
import { CreateIzinDto } from './dto/create-perizinan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('izin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IzinController {
  constructor(private readonly izinService: IzinService) {}

  @Post()
  @Roles('HRD')
  @UseInterceptors(FileInterceptor('lampiran'))
  async create(
    @Body() dto: CreateIzinDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const userId = req.user.userId;
    dto.lampiran = file ? file.filename : undefined;
    console.log('DTO:', dto);
    console.log('REQ USER:', req.user);

    return this.izinService.create(dto, userId);
  }

  @Get()
  @Roles('HRD', 'admin', 'Kadiv')
  async findAll() {
    return this.izinService.findAll();
  }
}
