import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'https://tonshop-fe.onrender.com',
    methods: ['GET', 'POST'],
  },
  namespace: '/transaction',
})
export class TransactionGateway {
  @WebSocketServer()
  server: Server;

  // Phương thức này sẽ gửi trạng thái giao dịch tới frontend
  notifyTransactionStatus(status: any) {
    this.server.emit('transactionStatus', status);
  }
}
