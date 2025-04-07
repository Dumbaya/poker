import { Module } from '@nestjs/common';
import { RoomController } from '../controller/room.controller';
import { RoomService } from '../service/room.service';
import { RedisModule } from 'src/util/module/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}
