import { Injectable } from '@nestjs/common';
import { CreateSpecServiceDto } from './dto/create-spec-service.dto';
import { UpdateSpecServiceDto } from './dto/update-spec-service.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SpecService, SpecServiceDocument } from './schemas/spec-service.schema';
import { Model } from 'mongoose';
import { Specialist, SpecialistDocument } from '../specialist/schemas/specialist.schema';

@Injectable()
export class SpecServiceService {
  constructor(@InjectModel(SpecService.name) private specServiceModel: Model<SpecServiceDocument>,
  @InjectModel(Specialist.name) private specialistModel: Model<SpecialistDocument>
  ) {}

  async create(createSpecServiceDto: CreateSpecServiceDto) {
    const newService = await this.specServiceModel.create(createSpecServiceDto)
    const spec = await this.specialistModel.findById(createSpecServiceDto.spec_id)

    spec.services.push(newService._id.toString());
    spec.save()
    return newService;
  }

  findAll() {
    return this.specServiceModel.find().populate(['spec_id', 'queues', 'service_id']);
  }

  findOne(id: string) {
    return `This action returns a #${id} specService`;
  }

  update(id: string, updateSpecServiceDto: UpdateSpecServiceDto) {
    return `This action updates a #${id} specService`;
  }

  remove(id: string) {
    return `This action removes a #${id} specService`;
  }
}
