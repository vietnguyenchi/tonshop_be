import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class TransactionGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    payload: { userId: string },
  ) {
    client.join(payload.userId);
  }

  notifyTransactionStatus(data: any, userId: string) {
    this.server.to(userId).emit('transactionStatus', data);
  }
}
