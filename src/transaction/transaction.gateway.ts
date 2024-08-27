import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true }) // Bật CORS nếu cần thiết
export class TransactionGateway {
  @WebSocketServer()
  server: Server;

  notifyTransactionStatus(status: any) {
    this.server.emit('transactionStatus', status);
  }
}
