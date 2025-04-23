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

    const roomKeys = keys.filter((key) => !key.includes(':users'));

    const results = await Promise.all(
      roomKeys.map(async (key) => {
        try {
          const data = await this.redisClient.hgetall(key);
          return this.parseRoomInfo(data);
        } catch (err) {
          console.error(`방 정보 로딩 실패 (key: ${key}):`, err);
          return null;
        }
      }),
    );

    return results.filter((room) => room !== null);
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
      room_id: data.room_id || '',
      room_title: data.room_title || '',
      max_player: Number(data.max_player) || 0,
      current_player: Number(data.current_player) || 0,
      host_nickname: data.host_nickname || '',
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

    const removed = await this.redisClient.srem(userKey, userNickname);
    if (removed === 0) {
      console.warn(`${userNickname} was not in room ${roomId}`);
    }

    const updatedPlayerCount = await this.redisClient.hincrby(
      key,
      'current_player',
      -1,
    );

    if (updatedPlayerCount <= 0) {
      await this.redisClient.del(key);
      await this.redisClient.del(userKey);
      console.log('test');
      return 'deleted';
    } else {
      return 'left';
    }
  }

  async enterRoom(roomId: string, userNickname: string): Promise<boolean> {
    const key = `room:${roomId}`;
    const userKey = `${key}:users`;

    console.log(`[enterRoom] TRYING TO ENTER ROOM`);
    console.log(`roomId: ${roomId}`);
    console.log(`userNickname: "${userNickname}"`);

    const exists = await this.redisClient.exists(key);
    if (!exists) throw new Error('방이 존재하지 않음');

    const current = await this.redisClient.hget(key, 'current_player');
    const max = await this.redisClient.hget(key, 'max_player');
    console.log(`current_player: ${current}, max_player: ${max}`);

    if (Number(current) >= Number(max)) {
      throw new Error('방이 가득 찼습니다.');
    }

    const alreadyInRoom = await this.redisClient.sismember(
      userKey,
      userNickname,
    );
    console.log(`alreadyInRoom: ${alreadyInRoom}`);

    if (alreadyInRoom) {
      console.log('이미 방에 있음');
      return true;
    }

    const added = await this.redisClient.sadd(userKey, userNickname);
    console.log(`sadd 결과: ${added}`);

    const newPlayerCount = await this.redisClient.hincrby(
      key,
      'current_player',
      1,
    );
    console.log(`current_player 증가 후: ${newPlayerCount}`);

    return true;
  }


  async getRoomUsers(roomId: string): Promise<string[]> {
    const userKey = `room:${roomId}:users`;
    return this.redisClient.smembers(userKey);
  }
}
