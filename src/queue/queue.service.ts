import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateQueueDto } from './dto/create-queue.dto';
import { UpdateQueueDto } from './dto/update-queue.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Queue, QueueDocument } from './schemas/queue.schema';
import { Model } from 'mongoose';
import { SpecService, SpecServiceDocument } from '../spec-service/schemas/spec-service.schema';
import { Specialist, SpecialistDocument } from '../specialist/schemas/specialist.schema';
import { SpecWorkingDay, SpecWorkingDayDocument } from '../spec-working-day/schemas/spec-working-day.schema';
import { Client, ClientDocument } from '../client/schemas/client.schema';

@Injectable()
export class QueueService {
  constructor(@InjectModel(Queue.name) private queueModel: Model<QueueDocument>,
  @InjectModel(SpecService.name) private specServiceModel: Model<SpecServiceDocument>,
  @InjectModel(SpecWorkingDay.name) private specWorkingDayModel: Model<SpecWorkingDayDocument>,
  @InjectModel(Client.name) private clientModel: Model<ClientDocument>
  ) {}

  async create(createQueueDto: CreateQueueDto) {
    const {spec_service_id, client_id, queue_data_time} = createQueueDto;
    const day = new Date(queue_data_time);
    const service = await this.specServiceModel.findById(spec_service_id);

    const working_day = await this.specWorkingDayModel.findOne({spec_id: service.spec_id.toString(), day_of_week: day.getDay()})
    
    if(!working_day){
      throw new BadRequestException("not working day")
    }
    const queue_number = await this.queueModel.count({spec_service_id, queue_data_time});
    const newQueue = await this.queueModel.create({spec_service_id, client_id, queue_number: queue_number+1, queue_data_time})
    service.queues.push(newQueue._id.toString());
    service.save()
    const client = await this.clientModel.findById(client_id)
    client.queues.push(newQueue._id.toString())
    client.save()
    return newQueue;
  }

  findAll() {
    return this.queueModel.find().populate('spec_service_id');
  }

  findOne(id: string) {
    const client = this.queueModel.find({}, {client_id: id}).populate('spec_service_id')
    return client
  }

  update(id: string, updateQueueDto: UpdateQueueDto) {
    return this.queueModel.findByIdAndUpdate(id,updateQueueDto, {new: true}).populate('spec_service_id');
  }

  remove(id: string) {
    return this.queueModel.findByIdAndRemove(id);
  }
}
