import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { JenisIzin } from '@prisma/client';

export class CreateIzinDto {
  @IsInt()
  id_karyawan: number;

  @IsEnum(JenisIzin)
  jenis: JenisIzin;

  @IsDateString()
  tanggal_mulai: string;

  @IsDateString()
  tanggal_selesai: string;

  @IsOptional()
  @IsString()
  alasan?: string;

  @IsOptional()
  @IsString()
  lampiran?: string;
}
