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
const fileAttachmentSchema = SchemaFactory.createForClass(FileAttachment);

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

  @Prop({ type: fileAttachmentSchema })
  Logo?: FileAttachment;

  @Prop({ type: fileAttachmentSchema })
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

  @Prop({ type: fileAttachmentSchema })
  legalAttachment?: FileAttachment;

  @Prop({ default: false })
  approvedByAdmin: boolean;
}

export const CompanySchema = SchemaFactory.createForClass(Company);

CompanySchema.virtual('jobs', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'companyId',
});

CompanySchema.set('toObject', { virtuals: true });
CompanySchema.set('toJSON', { virtuals: true });

CompanySchema.pre('findOneAndDelete', async function () {
  const query = this.getQuery() as { _id?: mongoose.Types.ObjectId };
  const companyId = query._id;

  if (companyId) {
    const JobModel = mongoose.model('Job');
    await JobModel.deleteMany({ companyId });
  }
});
