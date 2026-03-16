import { Module, Global, forwardRef } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { ChatModule } from '../Chat/chat.module';

@Global()
@Module({
  imports: [forwardRef(() => ChatModule)],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
