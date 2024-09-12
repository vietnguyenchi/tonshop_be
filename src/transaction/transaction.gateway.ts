import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'https://ton-shop.onrender.com',
  },
})
export class TransactionGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() transactionId: string,
  ) {
    client.join(transactionId);
    console.log(`Client joined room: ${transactionId}`);
  }

  notifyTransactionStatus(transactionId: string, data: any) {
    this.server.to(transactionId).emit('transactionStatus', data);
  }
}
