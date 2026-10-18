import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const passwordHash = await argon2.hash(dto.password);

    try {
      const result = await this.usersService.create(email, passwordHash);

      return result;
    } catch (err: any) {
      if (err.code === '23505') {
        throw new ConflictException('User with this email already exists');
      }

      throw err;
    }
  }
}
