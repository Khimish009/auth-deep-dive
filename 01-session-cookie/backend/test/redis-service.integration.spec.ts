import { randomUUID } from 'node:crypto';
import { Test, type TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';

import { RedisModule } from '../src/redis/redis.module.js';
import { RedisService } from '../src/redis/redis.service.js';

describe('RedisService — integration', () => {
  let moduleRef: TestingModule;
  let redisService: RedisService;

  const key = `test:session:${randomUUID()}`;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '../.env',
        }),
        RedisModule,
      ],
    }).compile();

    // Запускает NestJS lifecycle hooks.
    await moduleRef.init();

    redisService = moduleRef.get(RedisService);
  });

  afterAll(async () => {
    try {
      if (redisService) {
        await redisService.del(key);
      }
    } finally {
      await moduleRef?.close();
    }
  });

  it('stores and retrieves a value', async () => {
    await redisService.set(key, '42', 60);

    const value = await redisService.get(key);

    expect(value).toBe('42');
  });

  it('deletes a stored value', async () => {
    await redisService.set(key, '42', 60);

    await redisService.del(key);

    expect(await redisService.get(key)).toBeNull();
  });

  it('expires a value after TTL', async () => {
    await redisService.set(key, '42', 1);

    await new Promise((resolve) => setTimeout(resolve, 1250));

    expect(await redisService.get(key)).toBeNull();
  });
});
