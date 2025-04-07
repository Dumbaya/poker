import { Body, Controller, Get, Post } from '@nestjs/common';
import { RoomService } from '../service/room.service';
import { CreateRoomDto } from '../dto/create_room.dto';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('create_room')
  async createRoom(@Body() body: CreateRoomDto) {
    return this.roomService.createRoom(body);
  }

  @Get('get_list')
  async getRooms() {
    return this.roomService.getRooms();
  }
}
