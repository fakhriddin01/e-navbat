import { Injectable } from '@nestjs/common';
import { CreateSpecWorkingDayDto } from './dto/create-spec-working-day.dto';
import { UpdateSpecWorkingDayDto } from './dto/update-spec-working-day.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SpecWorkingDay, SpecWorkingDayDocument } from './schemas/spec-working-day.schema';
import { Model } from 'mongoose';
import { Specialist, SpecialistDocument } from '../specialist/schemas/specialist.schema';

@Injectable()
export class SpecWorkingDayService {

  constructor(
    @InjectModel(SpecWorkingDay.name) private specWorkingDayModel: Model<SpecWorkingDayDocument>,
    @InjectModel(Specialist.name) private specialistModel: Model<SpecialistDocument>
    ) {}



  async create(createSpecWorkingDayDto: CreateSpecWorkingDayDto) {
    const workingDay = await this.specWorkingDayModel.create(createSpecWorkingDayDto)
    const spec = await this.specialistModel.findById(createSpecWorkingDayDto.spec_id)

    spec.working_day.push(workingDay._id.toString());
    spec.save()
    return workingDay;
  }

  findAll(id: string) {
    return this.specWorkingDayModel.find({spec_id: id});
  }

  findOne(id: number) {
    return `This action returns a #${id} specWorkingDay`;
  }

  update(id: string, updateSpecWorkingDayDto: UpdateSpecWorkingDayDto) {
    return this.specWorkingDayModel.findByIdAndUpdate(id, updateSpecWorkingDayDto);
  }

  remove(id: number) {
    return `This action removes a #${id} specWorkingDay`;
  }
}
