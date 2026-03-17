import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { sendEmail } from '../../common/utils/email/send.email';
import { template } from '../../common/utils/email/template.email';
import {
  encrypt,
  decrypt,
} from '../../common/utils/encryption/encryption.util';

export type UserDocument = HydratedDocument<User>;

import { Providers, Genders, Roles, OTPTypes } from '../../common/enums/enums';
import { hash } from '../../common/utils/encryption/hash';

@Schema({ _id: false })
export class OTP {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true, enum: OTPTypes })
  type: OTPTypes;

  @Prop({ required: true, type: Date })
  expiresIn: Date;
}
const OTPSchema = SchemaFactory.createForClass(OTP);

@Schema({ _id: false })
export class Image {
  @Prop({ required: true })
  secure_url: string;

  @Prop({ required: true })
  public_id: string;
}
const ImageSchema = SchemaFactory.createForClass(Image);

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ select: false })
  password?: string;

  @Prop({ enum: Providers, required: true })
  provider: Providers;

  @Prop({ enum: Genders })
  gender?: Genders;

  @Prop({
    type: Date,
    validate: {
      validator: function (v: Date) {
        if (!v) return true;

        const today = new Date();

        if (v >= today) return false;

        let age = today.getFullYear() - v.getFullYear();
        const m = today.getMonth() - v.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < v.getDate())) {
          age--;
        }

        return age >= 18;
      },
      message:
        'DOB must be a valid past date and age must be strictly greater than 18 years.',
    },
  })
  DOB?: Date;

  @Prop()
  mobileNumber?: string;

  @Prop({ enum: Roles, default: Roles.USER })
  role: Roles;

  @Prop({ default: false })
  isConfirmed: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Date, default: null })
  bannedAt?: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  updatedBy?: User | mongoose.Types.ObjectId;

  @Prop({ type: Date })
  changeCredentialTime?: Date;

  @Prop({ type: ImageSchema })
  profilePic?: Image;

  @Prop({ type: ImageSchema })
  coverPic?: Image;

  @Prop({ type: [OTPSchema], default: [], select: false })
  OTP: OTP[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('username').get(function (this: UserDocument) {
  return `${this.firstName} ${this.lastName}`;
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

UserSchema.pre('save', async function () {
  if (this.isModified('password') && this.password) {
    const salt = Number(process.env.SALT) || 10;
    this.password = await hash(this.password, salt);
  }
});

UserSchema.pre('save', async function () {
  if (this.isModified('mobileNumber') && this.mobileNumber) {
    const secret = process.env.ENCRYPTION_KEY;
    if (secret) {
      this.mobileNumber = encrypt(this.mobileNumber, secret);
    }
  }
});

UserSchema.post('findOne', function (doc) {
  if (doc && doc.mobileNumber) {
    const secret = process.env.ENCRYPTION_KEY;
    if (secret) {
      doc.mobileNumber = decrypt(doc.mobileNumber as string, secret);
    }
  }
});

UserSchema.post('find', function (docs) {
  if (docs && Array.isArray(docs)) {
    const secret = process.env.ENCRYPTION_KEY;
    if (secret) {
      docs.forEach((doc) => {
        if (doc.mobileNumber) {
          doc.mobileNumber = decrypt(doc.mobileNumber as string, secret);
        }
      });
    }
  }
});

type DocWithOtpCode = UserDocument & { _otpCode?: string };

UserSchema.post('save', async function (doc: DocWithOtpCode) {
  const otpCode = doc._otpCode;
  if (!otpCode) return;

  const hasConfirmOtp = doc.OTP.some((o) => o.type === OTPTypes.CONFIRM_EMAIL);
  const hasForgetOtp = doc.OTP.some((o) => o.type === OTPTypes.FORGET_PASSWORD);

  if (hasConfirmOtp) {
    const subject = 'Job Search App - Email Verification';
    await sendEmail({
      to: doc.email,
      subject,
      html: template(Number(otpCode), doc.firstName, subject),
    });
  } else if (hasForgetOtp) {
    const subject = 'Job Search App - Password Reset';
    await sendEmail({
      to: doc.email,
      subject,
      html: template(Number(otpCode), doc.firstName, subject),
    });
  }

  doc._otpCode = undefined;
});

UserSchema.pre(['findOneAndDelete', 'deleteOne'], async function () {
  const user = await this.model.findOne(this.getQuery());
  if (user) {
    const ApplicationModel = mongoose.model('Application');
    await ApplicationModel.deleteMany({ userId: user._id });
  }
});
