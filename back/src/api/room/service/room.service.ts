import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateRoomDto } from '../dto/create_room.dto';
import { Redis } from 'ioredis';
import { UserService } from '../../user/service/user.service';
import { RoomInfo } from '../type/room.interface';

@Injectable()
export class RoomService {
  constructor(
    @Inject('REDIS_CLIENT') private redisClient: Redis,
    private readonly userService: UserService,
  ) {}

  async getRooms() {
    const keys = await this.redisClient.keys('room:*');
    return await Promise.all(
      keys.map(async (key) => {
        const data = await this.redisClient.hgetall(key);
        return this.parseRoomInfo(data);
      }),
    );
  }

  async createRoom(
    sessionToken: string,
    data: CreateRoomDto,
  ): Promise<RoomInfo> {
    const roomId = uuidv4();
    const key = `room:${roomId}`;
    const user = await this.userService.getSessionUser(sessionToken);

    const room: RoomInfo = {
      room_id: roomId,
      room_title: data.room_title,
      max_player: data.max_player,
      current_player: 1,
      host_nickname: user.user_nickname,
      is_locked: data.is_locked,
      password: data.is_locked ? (data.password ?? '') : '',
    };

    await this.redisClient.hset(key, room as any);

    await this.redisClient.sadd(`${key}:users`, user.user_nickname);

    return room;
  }

  private parseRoomInfo(data: Record<string, string>): RoomInfo {
    return {
      room_id: data.room_id,
      room_title: data.room_title,
      max_player: Number(data.max_player),
      current_player: Number(data.current_player),
      host_nickname: data.host_nickname,
      is_locked: data.is_locked === 'true',
      password: data.password ?? '',
    };
  }

  async leaveRoom(
    roomId: string,
    userNickname: string,
  ): Promise<'deleted' | 'left' | 'not_found'> {
    const key = `room:${roomId}`;
    const userKey = `${key}:users`;

    const exists = await this.redisClient.exists(key);
    if (!exists) throw new Error('방이 존재하지 않음');

    const roomData = await this.redisClient.hgetall(key);

    await this.redisClient.srem(userKey, userNickname);

    const currentPlayer = Number(roomData.current_player ?? 0);

    if (currentPlayer <= 1) {
      await this.redisClient.del(key);
      await this.redisClient.del(userKey);
      return 'deleted';
    } else {
      await this.redisClient.hincrby(key, 'current_player', -1);
      return 'left';
    }
  }

  async enterRoom(roomId: string, userNickname: string): Promise<boolean> {
    const key = `room:${roomId}`;
    const userKey = `room:${roomId}:users`;

    const exists = await this.redisClient.exists(key);
    if (!exists) throw new Error('방이 존재하지 않음');

    const current = await this.redisClient.hget(key, 'current_player');
    const max = await this.redisClient.hget(key, 'max_player');

    if (Number(current) >= Number(max)) {
      throw new Error('방이 가득 찼습니다.');
    }

    const added = await this.redisClient.sadd(userKey, userNickname);
    if (added === 0) {
      throw new Error('이미 입장한 사용자입니다.');
    }

    await this.redisClient.hincrby(key, 'current_player', 1);

    return true;
  }

  async getRoomUsers(roomId: string): Promise<string[]> {
    const userKey = `room:${roomId}:users`;
    return this.redisClient.smembers(userKey);
  }
}
