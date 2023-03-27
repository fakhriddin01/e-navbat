import { Module } from '@nestjs/common';
import { SpecialistService } from './specialist.service';
import { SpecialistController } from './specialist.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Specialist, SpecialistSchema } from './schemas/specialist.schema';
import { Otp, OtpSchema } from '../otp/schemas/otp.schema';
import { JwtModule } from '@nestjs/jwt';
import { Token, TokenSchema } from '../token/schemas/token.schema';
import { FilesModule } from '../files/files.module';

@Module({
  imports:[MongooseModule.forFeature([{name: Specialist.name, schema: SpecialistSchema}, {name: Otp.name, schema: OtpSchema}, {name: Token.name, schema: TokenSchema}]),
    JwtModule.register({}),
    FilesModule,
  ],
  controllers: [SpecialistController],
  providers: [SpecialistService]
})
export class SpecialistModule {}
