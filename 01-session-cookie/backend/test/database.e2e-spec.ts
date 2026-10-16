import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'; // Импортируем инструменты Vitest
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';

describe('Database Health Check (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    databaseService = moduleFixture.get<DatabaseService>(DatabaseService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health/db (GET) - success', async () => {
    // Используем vi.spyOn вместо jest.spyOn
    vi.spyOn(databaseService, 'health').mockResolvedValue(undefined);

    const response = await request(app.getHttpServer()).get('/health/db');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      database: 'connected',
    });
  });

  it('/health/db (GET) - database error (503)', async () => {
    // Симулируем ошибку базы данных через vi
    vi.spyOn(databaseService, 'health').mockRejectedValue(
      new Error('DB Connection Failed'),
    );

    const response = await request(app.getHttpServer()).get('/health/db');

    expect(response.status).toBe(503);
  });
});
