import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Service, ServiceDocument } from './schemas/service.schema';
import { Model } from 'mongoose';

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>) {}

  create(createServiceDto: CreateServiceDto) {
    return this.serviceModel.create(createServiceDto);
  }

  findAll() {
    return this.serviceModel.find();
  }

  findOne(id: string) {
    return this.serviceModel.findById(id);
  }

  update(id: string, updateServiceDto: UpdateServiceDto) {
    return this.serviceModel.findByIdAndUpdate(id, updateServiceDto);
  }

  remove(id: string) {
    return this.serviceModel.findByIdAndRemove(id);
  }
}
