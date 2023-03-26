import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ServiceDocument = HydratedDocument<Service>;

@Schema()
export class Service {
  @Prop()
  service_name: string;

  @Prop()
  service_price: number;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);