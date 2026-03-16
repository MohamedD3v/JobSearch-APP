import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/Auth/auth.module';
import { UserModule } from './modules/User/user.module';
import { CompanyModule } from './modules/Company/company.module';
import { JobModule } from './modules/Job/job.module';
import { ApplicationModule } from './modules/Application/application.module';
import { SocketModule } from './modules/Socket/socket.module';
import { EmailModule } from './common/services/email.module';
import { CloudinaryModule } from './common/services/cloudinary.module';
import { ChatModule } from './modules/Chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.dev', '.env'],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    UserModule,
    CompanyModule,
    JobModule,
    ApplicationModule,
    SocketModule,
    ChatModule,
    EmailModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
