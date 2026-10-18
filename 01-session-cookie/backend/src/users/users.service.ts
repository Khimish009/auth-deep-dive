import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';

export interface UserRow {
  id: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(email: string, passwordHash: string): Promise<UserRow> {
    const result = await this.databaseService.query<UserRow>(
      'INSERT INTO users (email, password_hash) VALUES($1, $2) RETURNING id, email, created_at, updated_at',
      [email, passwordHash],
    );

    return result.rows[0];
  }

  async findByEmail(
    email: string,
  ): Promise<(UserRow & { password_hash: string }) | null> {
    const result = await this.databaseService.query<
      UserRow & { password_hash: string }
    >(
      'SELECT id, email, password_hash, created_at, updated_at FROM users WHERE email = $1',
      [email],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }
}
