import { Module } from '@nestjs/common';
import { redisProvider } from '../provider/redis.provider';

@Module({
  providers: [redisProvider],
  exports: [redisProvider],
})
export class RedisModule {}
