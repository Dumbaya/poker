import { Controller, Post, Body, InternalServerErrorException } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { CreateUserDto } from '../dto/create_user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('sign_up')
  async Signup(@Body() dto: CreateUserDto) {
    try {
      return await this.userService.createUser(dto);
    } catch (e) {
      console.error('회원가입 실패:', e);
      throw new InternalServerErrorException('회원가입 중 오류 발생');
    }
  }
}
