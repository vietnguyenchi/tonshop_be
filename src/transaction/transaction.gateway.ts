import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'https://ton-shop.onrender.com',
    methods: ['GET', 'POST'],
  },
  namespace: '/transaction',
})
export class TransactionGateway {
  @WebSocketServer()
  server: Server;

  notifyTransactionStatus(status: any) {
    this.server.emit('transactionStatus', status);
  }
}
