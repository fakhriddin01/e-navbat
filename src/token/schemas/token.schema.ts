import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type TokenDocument = HydratedDocument<Token>;

@Schema({ timestamps: true, collection: 'tokens' })
export class Token {
  @Prop()
  table_name: string;

  @Prop()
  user_id: string;
  
  @Prop()
  user_os: string;

  @Prop()
  user_device: string;

  @Prop()
  hashed_token: string;

}

export const TokenSchema = SchemaFactory.createForClass(Token);