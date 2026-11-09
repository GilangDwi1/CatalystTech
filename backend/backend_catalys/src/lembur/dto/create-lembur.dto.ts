import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateLemburDto {
  @IsInt()
  id_karyawan: number;

  @IsInt()
  id_config_lembur: number;
}
