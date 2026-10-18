import { Test } from '@nestjs/testing';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as argon2 from 'argon2';
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterAll,
} from 'vitest';

import { AuthController } from '../src/auth/auth.controller.js';
import { AuthService } from '../src/auth/auth.service.js';
import { UsersService } from '../src/users/users.service.js';

describe('POST /auth/register', () => {
  let app: INestApplication;
  const createUser = vi.fn();

  const password = 'StrongPassword123!';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: { create: createUser },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    // В e2e-приложении main.ts не запускается.
    // Поэтому ValidationPipe подключаем явно.
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  beforeEach(() => {
    createUser.mockReset();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a user with a hashed password', async () => {
    createUser.mockResolvedValue({
      id: '42',
      email: 'test@example.com',
      created_at: new Date(),
      updated_at: new Date(),
    });

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'Test@Example.COM',
        password,
      });

    expect(response.status).toBe(201);

    // Проверяем нормализацию email.
    expect(createUser).toHaveBeenCalledOnce();
    const [email, passwordHash] = createUser.mock.calls[0] as [string, string];

    expect(email).toBe('test@example.com');

    // AuthService должен передать именно хеш.
    expect(passwordHash).not.toBe(password);
    expect(passwordHash.startsWith('$argon2id$')).toBe(true);
    expect(await argon2.verify(passwordHash, password)).toBe(true);

    // Проверяем публичный ответ.
    expect(response.body).toMatchObject({
      id: '42',
      email: 'test@example.com',
    });
    expect(response.body).not.toHaveProperty('password');
    expect(response.body).not.toHaveProperty('password_hash');
  });

  it('returns 400 for invalid input', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 12345,
        password: null,
      });

    expect(response.status).toBe(400);
    expect(createUser).not.toHaveBeenCalled();
  });

  it('rejects unexpected isAdmin field', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password,
        isAdmin: true,
      });

    expect(response.status).toBe(400);
    expect(createUser).not.toHaveBeenCalled();
  });

  it('returns 409 for duplicate email', async () => {
    createUser.mockRejectedValue(
      Object.assign(new Error('Duplicate email'), {
        code: '23505',
      }),
    );

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password,
      });

    expect(response.status).toBe(409);
    expect(createUser).toHaveBeenCalledOnce();
  });
});
