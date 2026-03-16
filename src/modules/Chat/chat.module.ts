import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Chat, ChatSchema } from '../../DB/models/chat.model';
import { Company, CompanySchema } from '../../DB/models/company.model';
import { SocketModule } from '../Socket/socket.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
    forwardRef(() => SocketModule),
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
