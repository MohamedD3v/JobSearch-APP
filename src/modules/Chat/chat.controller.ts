import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':userId')
  @UseGuards(AuthGuard)
  async getChatHistory(@Param('userId') buddyId: string, @Req() req: any) {
    const userId = req.user._id;
    return this.chatService.getChatHistory(userId, buddyId);
  }
}
