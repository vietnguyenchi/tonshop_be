import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: [
      'https://ton-shop.onrender.com',
      'https://ton-shop.onrender.com/transactionStatus',
      'https://tonshop-be.onrender.com',
    ],
  },
})
export class TransactionGateway {
  @WebSocketServer()
  server: Server;

  notifyTransactionStatus(status: any) {
    console.log('Emitting transaction status:', status);
    this.server.emit('transactionStatus', status);
  }
}
