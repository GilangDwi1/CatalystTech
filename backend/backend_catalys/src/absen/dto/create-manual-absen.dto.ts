import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateManualAbsenDto {
  @IsNumber()
  id_karyawan: number;

  @IsString()
  jenis: 'DATANG' | 'PULANG';

  @IsString()
  waktu: string; // '2025-12-05T09:30:00'

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  keterangan?: string;
}
