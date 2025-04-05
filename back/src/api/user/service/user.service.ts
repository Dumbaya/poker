import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { CreateUserDto } from '../dto/create_user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    console.log('받은 Dto', dto);
    const hashedPassword = await bcrypt.hash(dto.user_password, 10);

    const newUser = this.userRepository.create({
      ...dto,
      user_password: hashedPassword,
    });

    return this.userRepository.save(newUser);
  }
}
