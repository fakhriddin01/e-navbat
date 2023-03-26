import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SpecWorkingDayService } from './spec-working-day.service';
import { CreateSpecWorkingDayDto } from './dto/create-spec-working-day.dto';
import { UpdateSpecWorkingDayDto } from './dto/update-spec-working-day.dto';

@Controller('spec-working-day')
export class SpecWorkingDayController {
  constructor(private readonly specWorkingDayService: SpecWorkingDayService) {}

  @Post('create')
  create(@Body() createSpecWorkingDayDto: CreateSpecWorkingDayDto) {
    return this.specWorkingDayService.create(createSpecWorkingDayDto);
  }

  @Get(":id/all")
  findAll(@Param('id') id: string) {
    return this.specWorkingDayService.findAll(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.specWorkingDayService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSpecWorkingDayDto: UpdateSpecWorkingDayDto) {
    return this.specWorkingDayService.update(id, updateSpecWorkingDayDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.specWorkingDayService.remove(+id);
  }
}
