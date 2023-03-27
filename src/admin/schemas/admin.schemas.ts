import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { SpecWorkingDay } from '../../spec-working-day/schemas/spec-working-day.schema';

export type AdminDocument = HydratedDocument<Admin>;

@Schema({ timestamps: true, collection: 'admins' })
export class Admin {
  @Prop()
  admin_name: string;

  @Prop({unique: true})
  admin_phone_number: string;

  @Prop()
  admin_hashed_password: string;
  
  @Prop({default: true})
  admin_is_active: boolean;

  @Prop({default: false})
  admin_is_creator: boolean;

}

export const AdminSchema = SchemaFactory.createForClass(Admin);