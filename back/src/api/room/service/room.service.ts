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
}
