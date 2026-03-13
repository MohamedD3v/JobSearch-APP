import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.model';

export type CompanyDocument = HydratedDocument<Company>;

@Schema({ _id: false })
export class FileAttachment {
  @Prop({ required: true })
  secure_url: string;

  @Prop({ required: true })
  public_id: string;
}
const FileAttachmentSchema = SchemaFactory.createForClass(FileAttachment);

@Schema({ timestamps: true })
export class Company {
  @Prop({ required: true, unique: true })
  companyName: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  industry: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  numberOfEmployees: string;

  @Prop({ required: true, unique: true })
  companyEmail: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  CreatedBy: User | mongoose.Types.ObjectId;

  @Prop({ type: FileAttachmentSchema })
  Logo?: FileAttachment;

  @Prop({ type: FileAttachmentSchema })
  coverPic?: FileAttachment;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  HRs: (User | mongoose.Types.ObjectId)[];

  @Prop({ type: Date })
  bannedAt?: Date;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: FileAttachmentSchema })
  legalAttachment?: FileAttachment;

  @Prop({ default: false })
  approvedByAdmin: boolean;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
