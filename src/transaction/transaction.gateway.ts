import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true }) // Bật CORS nếu cần thiết
export class TransactionGateway {
  @WebSocketServer()
  server: Server;

  // Phương thức này sẽ gửi trạng thái giao dịch tới frontend
  notifyTransactionStatus(status: any) {
    this.server.emit('transactionStatus', status); // 'transactionStatus' là sự kiện mà frontend sẽ lắng nghe
  }
}
