import { IsDateString } from 'class-validator';

export class CreateLemburConfigDto {
  @IsDateString()
  tanggal: string;

  @IsDateString()
  jam_mulai: string;

  @IsDateString()
  jam_selesai: string;
}
