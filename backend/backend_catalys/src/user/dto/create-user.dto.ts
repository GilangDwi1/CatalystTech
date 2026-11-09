import { IsNotEmpty, IsString, IsInt, IsIn, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'ID karyawan tidak boleh kosong' })
  @IsInt({ message: 'ID karyawan harus berupa angka' })
  id_karyawan: number;

  @IsNotEmpty({ message: 'NIP tidak boleh kosong' })
  @IsString({ message: 'NIP harus berupa string' })
  NIP: string;

  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @IsString({ message: 'Password harus berupa string' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;

  @IsNotEmpty({ message: 'Role tidak boleh kosong' })
  @IsString({ message: 'Role harus berupa string' })
  @IsIn(['admin', 'HRD', 'kadiv', 'karyawan'], {
    message: 'Role harus salah satu dari: admin, HRD, kadiv, karyawan',
  })
  role: string;
}