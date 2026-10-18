import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';

interface UserRow {
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
}
