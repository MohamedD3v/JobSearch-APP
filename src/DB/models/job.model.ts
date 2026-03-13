import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.model';
import { Company } from './company.model';

export type JobDocument = HydratedDocument<Job>;

import {
  JobLocation,
  WorkingTime,
  SeniorityLevel,
} from '../../common/enums/enums';

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: true })
  jobTitle: string;

  @Prop({ required: true, enum: Object.values(JobLocation) })
  jobLocation: string;

  @Prop({ required: true, enum: Object.values(WorkingTime) })
  workingTime: string;

  @Prop({ required: true, enum: Object.values(SeniorityLevel) })
  seniorityLevel: string;

  @Prop({ required: true })
  jobDescription: string;

  @Prop({ type: [String], required: true })
  technicalSkills: string[];

  @Prop({ type: [String], required: true })
  softSkills: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  addedBy: User | mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  updatedBy: User | mongoose.Types.ObjectId;

  @Prop({ default: false })
  closed: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  })
  companyId: Company | mongoose.Types.ObjectId;
}

export const JobSchema = SchemaFactory.createForClass(Job);
