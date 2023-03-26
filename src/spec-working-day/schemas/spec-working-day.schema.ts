import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type SpecWorkingDayDocument = HydratedDocument<SpecWorkingDay>;

@Schema({ timestamps: true, collection: 'spec-working-day' })
export class SpecWorkingDay {

  @Prop()
  spec_id: string;

  @Prop()
  day_of_week: number;

  @Prop()
  start_time: string;
    
  @Prop()
  finish_time: string;
  
  @Prop()
  rest_start_time: string;
  
  @Prop()
  rest_finish_time: string;

}

export const SpecWorkingDaySchema = SchemaFactory.createForClass(SpecWorkingDay);