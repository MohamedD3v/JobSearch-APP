import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Job } from './job.model';
import { User } from './user.model';

export type ApplicationDocument = HydratedDocument<Application>;

import { ApplicationStatus } from '../../common/enums/enums';

@Schema({ timestamps: true })
export class Application {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true })
  jobId: Job | mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: User | mongoose.Types.ObjectId;

  @Prop({
    type: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    required: true,
  })
  userCV: { secure_url: string; public_id: string };

  @Prop({
    enum: Object.values(ApplicationStatus),
    default: ApplicationStatus.PENDING,
  })
  status: string;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
