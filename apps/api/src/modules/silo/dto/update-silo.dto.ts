import { PartialType } from '@nestjs/mapped-types';
import { CreateSiloDto } from './create-silo.dto';

export class UpdateSiloDto extends PartialType(CreateSiloDto) {}
