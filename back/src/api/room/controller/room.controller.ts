import { Body, Controller, Get, Post, Headers } from '@nestjs/common';
import { RoomService } from '../service/room.service';
import { CreateRoomDto } from '../dto/create_room.dto';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('create_room')
  async createRoom(
    @Body() body: CreateRoomDto,
    @Headers('Authorization') token: string,
  ) {
    try {
      return await this.roomService.createRoom(token, body);
    } catch (err) {
      console.error('방 생성 에러:', err);
      throw err;
    }
  }

  @Get('get_list')
  async getRooms() {
    return this.roomService.getRooms();
  }
}
