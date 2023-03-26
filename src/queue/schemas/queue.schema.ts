import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type QueueDocument = HydratedDocument<Queue>;

@Schema()
export class Queue {
  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'SpecService'})
  spec_service_id: string;

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Client'})
  client_id: string;

  @Prop()
  queue_data_time: Date;

  @Prop()
  queue_number: number;

}   

export const QueueSchema = SchemaFactory.createForClass(Queue);