import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: [
      'https://ton-shop.onrender.com',
      'https://ton-shop.onrender.com/transactionStatus',
    ],
  },
})
export class TransactionGateway {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  notifyTransactionStatus(status: any) {
    console.log('Emitting transaction status:', status);
    this.server.emit('transactionStatus', status);
  }
}
