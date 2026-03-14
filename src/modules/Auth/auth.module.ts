import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { User, UserSchema } from '../../DB/models/user.model';
import { hash } from '../../common/utils/encryption/hash';
import { encrypt } from '../../common/utils/encryption/encryption.util';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: (configService: ConfigService) => {
          const schema = UserSchema;
          schema.pre('save', async function () {
            if (this.isModified('password') && this.password) {
              const salt = Number(configService.get<string>('SALT'));
              this.password = await hash(this.password, salt);
            }
            if (this.isModified('mobileNumber') && this.mobileNumber) {
              const secret = configService.get<string>('ENCRYPTION_KEY');
              if (secret) {
                this.mobileNumber = encrypt(this.mobileNumber, secret);
              }
            }
          });
          return schema;
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
