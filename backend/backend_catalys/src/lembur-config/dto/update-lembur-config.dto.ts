import { PartialType } from '@nestjs/mapped-types';
import { CreateLemburConfigDto } from './create-lembur-config.dto';

export class UpdateLemburConfigDto extends PartialType(CreateLemburConfigDto) {}
