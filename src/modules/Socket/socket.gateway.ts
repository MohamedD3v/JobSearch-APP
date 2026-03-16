import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '../../common/utils/token/token.util';
import { ChatService } from '../Chat/chat.service';
import { Inject, forwardRef } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => ChatService))
    private chatService: ChatService,
  ) {}

  afterInit() {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        (client.handshake.headers?.token as string);

      if (!token) {
        throw new Error('No token provided');
      }

      const decoded = verifyToken({
        token,
        signature: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      });

      if (!decoded) {
        throw new Error('Invalid token');
      }

      (client as any).user = decoded;
      client.join(decoded._id);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect() {}

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { receiverId: string; message: string },
  ) {
    try {
      const sender = (client as any).user;
      if (!sender) {
        throw new WsException('Unauthorized');
      }

      const { receiverId, message } = payload;
      const chat = await this.chatService.sendMessage(
        sender._id,
        receiverId,
        message,
      );

      this.server.to(receiverId).emit('receiveMessage', {
        senderId: sender._id,
        message,
        createdAt: new Date(),
      });

      return { status: 'success', data: chat };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  emitNewApplication(companyId: string, applicationData: any) {
    this.server.to(companyId).emit('newApplication', applicationData);
  }
}
