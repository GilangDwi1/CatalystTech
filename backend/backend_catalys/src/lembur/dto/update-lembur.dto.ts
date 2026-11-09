import { IsOptional, IsInt } from 'class-validator';

export class UpdateLemburDto {
  @IsOptional()
  @IsInt()
  id_karyawan?: number;

  @IsOptional()
  @IsInt()
  id_config_lembur?: number;
}
