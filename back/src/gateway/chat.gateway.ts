import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private rooms: Map<string, string> = new Map();

  handleConnection(client: Socket) {
    console.log(`[소켓 연결] 클라이언트 연결됨: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[소켓 연결 해제] 클라이언트 해제: ${client.id}`);
    const roomId = this.rooms.get(client.id);
    if (roomId) {
      client.leave(roomId);
      this.rooms.delete(client.id);
      // 유저 나갔다고 방에 알림
      this.updateUserList(roomId);
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, roomId: string) {
    const nickname = client.handshake.query.nickname as string;
    if (!nickname) {
      console.log(
        `[joinRoom] nickname이 없습니다. 기본값 '익명'을 사용합니다.`,
      );
      client.handshake.query.nickname = '익명';
    }
    console.log(`[joinRoom] ${nickname} -> ${roomId}`);
    client.join(roomId);
    this.rooms.set(client.id, roomId);

    // 유저 리스트 업데이트
    this.updateUserList(roomId);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, roomId: string) {
    console.log(`[leaveRoom] ${client.id} -> ${roomId}`);
    client.leave(roomId);
    this.rooms.delete(client.id);

    this.updateUserList(roomId);
  }

  @SubscribeMessage('sendChat')
  handleSendChat(client: Socket, payload: { roomId: string; message: string }) {
    const nickname = (client.handshake.query.nickname as string) || '익명';
    const timestamp = new Date().toISOString();

    console.log(`[sendChat] ${nickname}: ${payload.message} at ${timestamp}`);

    this.server.to(payload.roomId).emit('chatMessage', {
      nickname,
      message: payload.message,
      timestamp,
    });
  }

  private updateUserList(roomId: string) {
    const clients = this.server.sockets.adapter.rooms.get(roomId);
    const userList = clients
      ? Array.from(clients).map((id) => {
          const client = this.server.sockets.sockets.get(id);
          return client?.handshake.query.nickname || '익명';
        })
      : [];

    this.server.to(roomId).emit('userList', userList);
  }
}
