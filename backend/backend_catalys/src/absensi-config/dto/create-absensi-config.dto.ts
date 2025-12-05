import { IsDate, IsEnum, IsInt } from 'class-validator';
import { JenisAbsen } from '@prisma/client';

export class CreateAbsensiConfigDto {
  @IsDate()
  tanggal: Date;

  @IsDate()
  jam_mulai: Date;

  @IsDate()
  jam_selesai: Date;

  @IsEnum(JenisAbsen)
  jenis: JenisAbsen;

  @IsInt()
  dibuat_oleh: number; // id user HRD
}
