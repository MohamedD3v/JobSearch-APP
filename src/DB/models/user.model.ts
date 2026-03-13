import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum Providers {
  GOOGLE = 'google',
  SYSTEM = 'system',
}

export enum Genders {
  MALE = 'Male',
  FEMALE = 'Female',
}

export enum Roles {
  USER = 'User',
  ADMIN = 'Admin',
}

export enum OTPTypes {
  CONFIRM_EMAIL = 'confirmEmail',
  FORGET_PASSWORD = 'forgetPassword',
}

@Schema({ _id: false })
export class OTP {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true, enum: OTPTypes })
  type: string;

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
  provider: string;

  @Prop({ enum: Genders })
  gender?: string;

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
  role: string;

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
