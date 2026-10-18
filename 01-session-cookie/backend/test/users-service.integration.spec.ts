import { randomUUID } from 'node:crypto';
import { Test, type TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import { DatabaseModule } from '../src/database/database.module.js';
import { DatabaseService } from '../src/database/database.service.js';
import { UsersService } from '../src/users/users.service.js';

describe('UsersService — PostgreSQL integration', () => {
  let moduleFixture: TestingModule;
  let usersService: UsersService;
  let databaseService: DatabaseService;

  const email = `test-${randomUUID()}@example.com`;
  const passwordHash = 'test-password-hash';

  let createdUserId: string | undefined;

  beforeAll(async () => {
    // Используем отдельную тестовую БД.
    process.env.DB_NAME = 'auth_learning_test';

    moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '../.env',
        }),
        DatabaseModule,
      ],
      providers: [UsersService],
    }).compile();

    usersService = moduleFixture.get(UsersService);
    databaseService = moduleFixture.get(DatabaseService);
  });

  afterAll(async () => {
    try {
      if (createdUserId && databaseService) {
        await databaseService.query('DELETE FROM users WHERE id = $1', [
          createdUserId,
        ]);
      }
    } finally {
      await moduleFixture?.close();
    }
  });

  it('creates a user without exposing password_hash', async () => {
    const user = await usersService.create(email, passwordHash);

    createdUserId = user.id;

    expect(user.id).toEqual(expect.any(String));
    expect(user.email).toBe(email);
    expect(user.created_at).toBeInstanceOf(Date);
    expect(user.updated_at).toBeInstanceOf(Date);

    expect(user).not.toHaveProperty('password_hash');

    // Проверяем, что hash действительно сохранился в БД.
    const result = await databaseService.query<{
      password_hash: string;
    }>('SELECT password_hash FROM users WHERE id = $1', [user.id]);

    expect(result.rows[0]?.password_hash).toBe(passwordHash);
  });

  it('rejects duplicate email with PostgreSQL error 23505', async () => {
    await expect(
      usersService.create(email, passwordHash),
    ).rejects.toMatchObject({
      code: '23505',
    });
  });
});
