import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/room',
  cors: {
    origin: '*',
  },
})
export class RoomGateway implements OnGatewayInit {
  @WebSocketServer()
  server!: Server;

  afterInit() {
    console.log('Socket server started');
  }

  emitRoomsUpdated() {
    this.server.emit('rooms-updated');
  }

  @SubscribeMessage('startGame')
  handleStartGame(
    @MessageBody() data: { room_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { room_id } = data;
    this.server.to(room_id).emit('gameStarted', { room_id });
    console.log(`Game started in room: ${room_id}`);
  }
}
