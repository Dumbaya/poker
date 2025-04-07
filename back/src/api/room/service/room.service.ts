import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateRoomDto } from '../dto/create_room.dto';
import { Redis } from 'ioredis';

@Injectable()
export class RoomService {
  constructor(@Inject('REDIS_CLIENT') private redisClient: Redis) {}

  async getRooms() {
    const keys = await this.redisClient.keys('room:*');
    return await Promise.all(keys.map((key) => this.redisClient.hgetall(key)));
  }

  async createRoom(data: CreateRoomDto) {
    const roomId = uuidv4();
    const key = `room:${roomId}`;
    await this.redisClient.hset(key, {
      ...data,
      room_id: roomId,
      current_player: 1,
    });

    return this.redisClient.hgetall(key);
  }
}
