import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRow, UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import argon2 from 'argon2';
import { DUMMY_PASSWORD_HASH } from './constants.js';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(dto: RegisterDto): Promise<UserRow> {
    const email = dto.email.trim().toLowerCase();
    const passwordHash = await argon2.hash(dto.password);

    try {
      const result = await this.usersService.create(email, passwordHash);

      return result;
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        err.code === '23505'
      ) {
        throw new ConflictException('User with this email already exists');
      }

      throw err;
    }
  }

  async validateCredentials(email: string, password: string): Promise<UserRow> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (!user) {
      await argon2.verify(DUMMY_PASSWORD_HASH, password);

      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await argon2.verify(user.password_hash, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { password_hash, ...safeUser } = user;

    return safeUser;
  }
}
