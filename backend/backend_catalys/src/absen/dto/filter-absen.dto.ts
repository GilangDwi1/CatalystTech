import { IsOptional, IsString, IsInt } from 'class-validator';

export class FilterAbsenDto {
  @IsOptional()
  @IsString()
  tanggal?: string; // yyyy-mm-dd

  @IsOptional()
  @IsInt()
  divisiId?: number;

  @IsOptional()
  @IsInt()
  gradeId?: number;
}
