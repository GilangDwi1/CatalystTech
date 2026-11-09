import { IsArray, IsInt, ArrayNotEmpty } from 'class-validator';

export class BulkCreateLemburDto {
  @IsArray()
  @ArrayNotEmpty()
  id_karyawan_list: number[];

  @IsInt()
  id_config_lembur: number;
}
