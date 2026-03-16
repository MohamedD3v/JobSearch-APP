import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.model';

export type ChatDocument = HydratedDocument<Chat>;

@Schema({ _id: false, timestamps: true })
export class Message {
  @Prop({ required: true })
  message: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  senderId: User | mongoose.Types.ObjectId;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

@Schema({ timestamps: true })
export class Chat {
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    required: true,
  })
  participants: (User | mongoose.Types.ObjectId)[];

  @Prop({ type: [MessageSchema], default: [] })
  messages: Message[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
