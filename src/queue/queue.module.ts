import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Queue, QueueSchema } from './schemas/queue.schema';
import { SpecWorkingDay, SpecWorkingDaySchema } from '../spec-working-day/schemas/spec-working-day.schema';
import { Specialist, SpecialistSchema } from '../specialist/schemas/specialist.schema';
import { SpecService, SpecServiceSchema } from '../spec-service/schemas/spec-service.schema';
import { Client, ClientSchema } from '../client/schemas/client.schema';

@Module({
  imports:[MongooseModule.forFeature(
    [{name: Queue.name, schema: QueueSchema},
      {name: SpecWorkingDay.name, schema: SpecWorkingDaySchema}, 
      {name: Specialist.name, schema: SpecialistSchema},
      {name: SpecService.name, schema: SpecServiceSchema},
      {name: Client.name, schema: ClientSchema}
    ])
],
  controllers: [QueueController],
  providers: [QueueService]
})
export class QueueModule {}
