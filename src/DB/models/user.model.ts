import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { sendEmail } from '../../common/utils/email/send.email';
import { template } from '../../common/utils/email/template.email';

export type UserDocument = HydratedDocument<User>;

import { Providers, Genders, Roles, OTPTypes } from '../../common/enums/enums';

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

  @Prop()
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

  @Prop({ type: Date })
  bannedAt?: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  updatedBy?: User | mongoose.Types.ObjectId;

  @Prop({ type: Date })
  changeCredentialTime?: Date;

  @Prop({ type: ImageSchema })
  profilePic?: Image;

  @Prop({ type: ImageSchema })
  coverPic?: Image;

  @Prop({ type: [OTPSchema], default: [] })
  OTP: OTP[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('username').get(function (this: UserDocument) {
  return `${this.firstName} ${this.lastName}`;
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

UserSchema.pre('findOneAndDelete', async function () {
  try {
    const query = this.getQuery() as { _id?: mongoose.Types.ObjectId };
    const userId = query._id;

    if (userId) {
      const CompanyModel = mongoose.model('Company');
      await CompanyModel.deleteMany({ CreatedBy: userId });
    }
  } catch (error) {
    console.error('Error cascading delete for companies:', error);
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
