import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FacesService } from './faces.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('faces')
export class FacesController {
  constructor(private readonly facesService: FacesService) {}

  // 1️⃣ Upload foto wajah
  @Post('upload/:id_karyawan')
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: './uploads/faces',
        filename: (req, file, cb) => {
          cb(null, Date.now() + extname(file.originalname));
        },
      }),
    }),
  )
  async uploadFace(
    @Param('id_karyawan') id_karyawan: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File foto tidak ditemukan');
    }

    return this.facesService.uploadFace(+id_karyawan, file.filename);
  }

  // 2️⃣ Cek jumlah foto
  @Get('check/:id_karyawan')
  async checkFaces(@Param('id_karyawan') id_karyawan: number) {
    return this.facesService.checkFaces(+id_karyawan);
  }

  // 3️⃣ Generate embedding setelah 5 foto
  @Post('generate/:id_karyawan')
  async generateEmbedding(@Param('id_karyawan') id_karyawan: number) {
    return this.facesService.generateEmbedding(+id_karyawan);
  }

  // 4️⃣ Hapus semua foto & embedding
  @Delete('clear/:id_karyawan')
  async clearFaces(@Param('id_karyawan') id_karyawan: number) {
    return this.facesService.clearFaces(+id_karyawan);
  }

  // 5️⃣ Update foto tertentu
  @Post('update/:face_id')
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: './uploads/faces',
        filename: (req, file, cb) => {
          cb(null, Date.now() + extname(file.originalname));
        },
      }),
    }),
  )
  async updateFace(
    @Param('face_id') faceId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.facesService.updateFace(+faceId, file.filename);
  }
}
