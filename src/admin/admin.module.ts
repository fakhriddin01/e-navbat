import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Admin, AdminSchema } from './schemas/admin.schemas';
import { Token, TokenSchema } from '../token/schemas/token.schema';

@Module({
  imports:[MongooseModule.forFeature([{name: Admin.name, schema: AdminSchema}, {name: Token.name, schema: TokenSchema}]),
    JwtModule.register({}),
  ],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
