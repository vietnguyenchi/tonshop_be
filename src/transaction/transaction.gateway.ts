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

  @SubscribeMessage('transactionStatus')
  notifyTransactionStatus(data: any, userId: string) {
    this.server.to(userId).emit('transactionStatus', data);
  }
}
