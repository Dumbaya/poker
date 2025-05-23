import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { SignupUserDto } from '../dto/signup_user.dto';
import { SigninUserDto } from '../dto/signin_user.dto';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Redis } from 'ioredis';
import { SessionData } from '../type/session_data.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
  ) {}

  async signupUser(dto: SignupUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(dto.user_password, 10);

    const newUser = this.userRepository.create({
      ...dto,
      user_password: hashedPassword,
    });

    return this.userRepository.save(newUser);
  }

  async signinUser(dto: SigninUserDto): Promise<{ token: string }> {
    const user = await this.userRepository.findOne({
      where: { user_id: dto.user_id },
    });

    if (!user) throw new UnauthorizedException('존재하지 않는 사용자입니다.');

    const isMatch = await bcrypt.compare(dto.user_password, user.user_password);

    if (!isMatch)
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');

    const existingSessionToken = await this.redisClient.get(
      `user_session:${user.user_id}`,
    );
    if (existingSessionToken) {
      await this.redisClient.del(`session:${existingSessionToken}`);
      await this.redisClient.del(`user_session:${user.user_id}`);
    }
    const sessionToken = uuidv4();

    await this.redisClient.setex(
      `session:${sessionToken}`,
      60 * 60,
      JSON.stringify({
        user_id: user.user_id,
        user_nickname: user.user_nickname,
        user_role: user.user_role,
      }),
    );

    await this.redisClient.setex(
      `user_session:${user.user_id}`,
      60 * 60,
      sessionToken,
    );
    console.log('로그인 완료');
    return { token: sessionToken };
  }

  async getSessionUser(sessionToken: string) {
    try {
      console.log(sessionToken);
      const session = await this.redisClient.get(`session:${sessionToken}`);
      console.log('Redis에서 가져온 세션:', session);
      if (!session) {
        throw new UnauthorizedException('유효하지 않은 세션입니다.');
      }
      return JSON.parse(session) as SessionData;
    } catch (error) {
      console.error('getSessionUser 오류:', error);
      throw error;
    }
  }
}
