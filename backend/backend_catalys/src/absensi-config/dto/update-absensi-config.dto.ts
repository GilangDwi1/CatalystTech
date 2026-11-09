import { PartialType } from '@nestjs/mapped-types';
import { CreateAbsensiConfigDto } from './create-absensi-config.dto';

export class UpdateAbsensiConfigDto extends PartialType(
  CreateAbsensiConfigDto,
) {}
