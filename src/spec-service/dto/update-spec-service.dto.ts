import { PartialType } from '@nestjs/mapped-types';
import { CreateSpecServiceDto } from './create-spec-service.dto';

export class UpdateSpecServiceDto extends PartialType(CreateSpecServiceDto) {}
