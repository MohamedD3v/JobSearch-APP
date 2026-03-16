import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, ChatDocument } from '../../DB/models/chat.model';
import { Company, CompanyDocument } from '../../DB/models/company.model';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  ) {}

  async getChatHistory(userId: string, buddyId: string) {
    const chat = await this.chatModel
      .findOne({
        participants: {
          $all: [new Types.ObjectId(userId), new Types.ObjectId(buddyId)],
        },
      })
      .populate('participants', 'firstName lastName email profilePic');

    if (!chat) {
      return { messages: [] };
    }

    return chat;
  }

  async sendMessage(senderId: string, receiverId: string, message: string) {
    let chat = await this.chatModel.findOne({
      participants: {
        $all: [new Types.ObjectId(senderId), new Types.ObjectId(receiverId)],
      },
    });

    if (!chat) {
      const isAuthorized = await this.companyModel.findOne({
        $or: [
          { CreatedBy: new Types.ObjectId(senderId) },
          { HRs: new Types.ObjectId(senderId) },
        ],
      });

      if (!isAuthorized) {
        throw new ForbiddenException(
          'Only HR or Company Owner can start a conversation',
        );
      }

      chat = new this.chatModel({
        participants: [
          new Types.ObjectId(senderId),
          new Types.ObjectId(receiverId),
        ],
        messages: [],
      });
    }

    chat.messages.push({
      senderId: new Types.ObjectId(senderId),
      message,
    } as any);

    await chat.save();
    return chat;
  }
}
