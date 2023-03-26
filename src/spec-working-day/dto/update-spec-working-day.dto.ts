import { PartialType } from '@nestjs/mapped-types';
import { CreateSpecWorkingDayDto } from './create-spec-working-day.dto';

export class UpdateSpecWorkingDayDto extends PartialType(CreateSpecWorkingDayDto) {}
