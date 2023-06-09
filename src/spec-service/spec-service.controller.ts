import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SpecServiceService } from './spec-service.service';
import { CreateSpecServiceDto } from './dto/create-spec-service.dto';
import { UpdateSpecServiceDto } from './dto/update-spec-service.dto';

@Controller('spec-service')
export class SpecServiceController {
  constructor(private readonly specServiceService: SpecServiceService) {}

  @Post('create')
  create(@Body() createSpecServiceDto: CreateSpecServiceDto) {
    return this.specServiceService.create(createSpecServiceDto);
  }

  @Get('all')
  findAll() {
    return this.specServiceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.specServiceService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSpecServiceDto: UpdateSpecServiceDto) {
    return this.specServiceService.update(id, updateSpecServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.specServiceService.remove(id);
  }
}
