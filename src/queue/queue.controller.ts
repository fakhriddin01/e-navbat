import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { QueueService } from './queue.service';
import { CreateQueueDto } from './dto/create-queue.dto';
import { UpdateQueueDto } from './dto/update-queue.dto';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post('create')
  create(@Body() createQueueDto: CreateQueueDto) {
    return this.queueService.create(createQueueDto);
  }

  @Get('all')
  findAll() {
    return this.queueService.findAll();
  }

  @Get(':id/all')
  findOneClientsQueue(@Param('id') id: string) {
    return this.queueService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQueueDto: UpdateQueueDto) {
    return this.queueService.update(id, updateQueueDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.queueService.remove(id);
  }
}
