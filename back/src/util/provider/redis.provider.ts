import { Redis } from 'ioredis';
import RedisClient from 'ioredis';

export const redisProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: (): Redis => {
    return new RedisClient({
      host: 'redis', // docker-compose 기준
      port: 6379,
    });
  },
};
