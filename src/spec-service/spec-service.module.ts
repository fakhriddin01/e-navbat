import { Module } from '@nestjs/common';
import { SpecServiceService } from './spec-service.service';
import { SpecServiceController } from './spec-service.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SpecService, SpecServiceSchema } from './schemas/spec-service.schema';
import { Specialist, SpecialistSchema } from '../specialist/schemas/specialist.schema';

@Module({
  imports:[MongooseModule.forFeature([{name: SpecService.name, schema: SpecServiceSchema},{name: Specialist.name, schema: SpecialistSchema}])
],
  controllers: [SpecServiceController],
  providers: [SpecServiceService]
})
export class SpecServiceModule {}
