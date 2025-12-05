import { IsOptional, IsString, IsIn, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  id_karyawan?: number;

  @IsOptional()
  @IsString()
  NIP?: string;
  
  @IsOptional()
  @IsString({ message: 'Password harus berupa string' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password?: string;

  @IsOptional()
  @IsString({ message: 'Role harus berupa string' })
  @IsIn(['admin', 'HRD', 'kadiv', 'karyawan'], {
    message: 'Role harus salah satu dari: admin, HRD, kadiv, karyawan',
  })
  role?: string;
}