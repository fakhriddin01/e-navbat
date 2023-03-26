import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Client, ClientSchema } from './schemas/client.schema';
import { Otp, OtpSchema } from '../otp/schemas/otp.schema';
import { Token, TokenSchema } from '../token/schemas/token.schema';
import { JwtModule } from '@nestjs/jwt';
import { FilesModule } from '../../files/files.module';

@Module({
  imports:[MongooseModule.forFeature(
    [{name: Client.name, schema: ClientSchema}, {name: Otp.name, schema: OtpSchema}, {name: Token.name, schema: TokenSchema}]),
  JwtModule.register({}),
  FilesModule,
],
  controllers: [ClientController],
  providers: [ClientService]
})
export class ClientModule {}
