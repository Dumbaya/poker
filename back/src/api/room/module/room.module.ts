import { Module } from '@nestjs/common';
import { RoomController } from '../controller/room.controller';
import { RoomService } from '../service/room.service';
import { RedisModule } from 'src/util/module/redis.module';
import { RoomGateway } from 'src/gateway/room.gateway';
import { UserModule } from '../../user/module/user.module';

@Module({
  imports: [RedisModule, UserModule],
  controllers: [RoomController],
  providers: [RoomService, RoomGateway],
  exports: [RoomService],
})
export class RoomModule {}
