import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SpecialistModule } from './specialist/specialist.module';
import { OtpModule } from './otp/otp.module';
import { TokenModule } from './token/token.module';
import { FilesModule } from '../files/files.module';
import { ClientModule } from './client/client.module';
import { SpecWorkingDayModule } from './spec-working-day/spec-working-day.module';
import { ServiceModule } from './service/service.module';


@Module({
    imports: [
        ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true}),
        MongooseModule.forRoot(process.env.MONGO_URI),
        SpecialistModule,
        OtpModule,
        TokenModule,
        FilesModule,
        ClientModule,
        SpecWorkingDayModule,
        ServiceModule   
    ],
    controllers: [],
    providers: [],
    exports: []
})
export class AppModule {}
