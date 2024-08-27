import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'https://172.29.208.1:5173',
    methods: ['GET', 'POST'],
  },
})
export class TransactionGateway {
  @WebSocketServer()
  server: Server;

  notifyTransactionStatus(status: any) {
    this.server.emit('transactionStatus', status);
  }
}
