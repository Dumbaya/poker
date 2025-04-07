import {
  Controller,
  Post,
  Body,
  InternalServerErrorException,
  UnauthorizedException,
  Get,
  Inject,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { SignupUserDto } from '../dto/signup_user.dto';
import { SigninUserDto } from '../dto/signin_user.dto';
import { Headers } from '@nestjs/common';
import { SessionData } from '../type/session_data.interface';
import { Redis } from 'ioredis';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  @Post('sign_up')
  async Signup(@Body() dto: SignupUserDto) {
    try {
      return await this.userService.signupUser(dto);
    } catch (e) {
      console.error('회원가입 실패:', e);
      throw new InternalServerErrorException('회원가입 중 오류 발생');
    }
  }

  @Post('sign_in')
  async Signin(@Body() dto: SigninUserDto) {
    try {
      return await this.userService.signinUser(dto);
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        throw e;
      }

      console.error('로그인 실패:', e);
      throw new InternalServerErrorException('로그인 중 오류 발생');
    }
  }

  @Get('chk_session')
  async getSession(
    @Headers('Authorization') tokenHeader: string,
  ): Promise<SessionData> {
    const token = tokenHeader?.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('세션 토큰이 없습니다.');
    }

    const session = await this.userService.getSessionUser(token);
    return session;
  }

  @Post('sign_out')
  async Singout(@Headers('Authorization') tokenHeader: string) {
    const token = tokenHeader?.replace('Bearer', '');
    if (!token) {
      throw new UnauthorizedException('세션 토큰이 없습니다.');
    }

    const session = await this.redisClient.get(token);

    if (session) {
      const { user_id } = JSON.parse(session) as { user_id: string };
      await this.redisClient.del(`session:${token}`);
      await this.redisClient.del(`user_session:${user_id}`);
    }

    return { message: '로그아웃 성공' };
  }
}
