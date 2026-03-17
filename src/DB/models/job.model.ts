import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.model';
import { Company } from './company.model';
import {
  JobLocation,
  WorkingTime,
  SeniorityLevel,
} from '../../common/enums/enums';

export type JobDocument = HydratedDocument<Job>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Job {
  @Prop({ required: true })
  jobTitle: string;

  @Prop({ required: true, enum: JobLocation })
  jobLocation: JobLocation;

  @Prop({ required: true, enum: WorkingTime })
  workingTime: WorkingTime;

  @Prop({ required: true, enum: SeniorityLevel })
  seniorityLevel: SeniorityLevel;

  @Prop({ required: true })
  jobDescription: string;

  @Prop({ type: [String], required: true })
  technicalSkills: string[];

  @Prop({ type: [String], required: true })
  softSkills: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  addedBy: User | mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  })
  companyId: Company | mongoose.Types.ObjectId;
}

export const JobSchema = SchemaFactory.createForClass(Job);

JobSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'jobId',
});

JobSchema.pre(['findOneAndDelete', 'deleteOne'], async function () {
  const job = await this.model.findOne(this.getQuery());
  if (job) {
    const ApplicationModel = mongoose.model('Application');
    await ApplicationModel.deleteMany({ jobId: job._id });
  }
});
