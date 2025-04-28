import {
  Body,
  Controller,
  Get,
  Post,
  Headers,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { RoomService } from '../service/room.service';
import { CreateRoomDto } from '../dto/create_room.dto';
import { UserService } from '../../user/service/user.service';

@Controller('rooms')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly userService: UserService,
  ) {}

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

  @Delete('delete/:roomId')
  async deleteRoom(
    @Param('roomId') roomId: string,
    @Headers('Authorization') token: string,
  ) {
    try {
      const user = await this.userService.getSessionUser(token);
      const result = await this.roomService.leaveRoom(
        roomId,
        user.user_nickname,
      );

      if (result === 'deleted') {
        return { flag: 'success', message: '방이 삭제되었습니다.' };
      } else if (result === 'left') {
        return { flag: 'success', message: '방에서 나갔습니다.' };
      } else {
        return { flag: 'fail', message: '방을 찾을 수 없습니다.' };
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { flag: 'fail', message: error.message };
      }
      return { flag: 'fail', message: '알 수 없는 오류' };
    }
  }

  @Patch('enter/:roomId')
  async enterRoom(
    @Param('roomId') roomId: string,
    @Headers('Authorization') token: string,
    @Body('password') password: string,
  ) {
    try {
      console.log('[Controller] PATCH /enter/:roomId');
      console.log('roomId:', roomId);
      console.log('token:', token);
      const user = await this.userService.getSessionUser(token);
      console.log('user:', user);
      await this.roomService.enterRoom(roomId, user.user_nickname, password);
      return { flag: 'success', message: '입장 성공' };
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof Error) {
        return { flag: 'fail', message: error.message };
      }
      return { flag: 'fail', message: '알 수 없는 오류' };
    }
  }

  @Get('users/:roomId')
  async getRoomUsers(@Param('roomId') roomId: string) {
    const users = await this.roomService.getRoomUsers(roomId);
    return { users };
  }
}
