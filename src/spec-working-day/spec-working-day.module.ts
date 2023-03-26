import { Module } from '@nestjs/common';
import { SpecWorkingDayService } from './spec-working-day.service';
import { SpecWorkingDayController } from './spec-working-day.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SpecWorkingDay, SpecWorkingDaySchema } from './schemas/spec-working-day.schema';
import { Specialist, SpecialistSchema } from '../specialist/schemas/specialist.schema';

@Module({
  imports:[MongooseModule.forFeature([{name: SpecWorkingDay.name, schema: SpecWorkingDaySchema}, {name: Specialist.name, schema: SpecialistSchema}]),
  ],
  controllers: [SpecWorkingDayController],
  providers: [SpecWorkingDayService]
})
export class SpecWorkingDayModule {}
