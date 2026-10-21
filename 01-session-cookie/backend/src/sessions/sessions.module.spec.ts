import { describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';

import { SessionsModule } from './sessions.module.js';
import { SessionsService } from './sessions.service.js';

describe('SessionsModule — dependency injection', () => {
  it('injects RedisService into SessionsService', async () => {
    const set = vi.fn().mockResolvedValue('OK');

    const moduleRef = await Test.createTestingModule({
      imports: [SessionsModule],
    })
      .overrideProvider('REDIS_CLIENT')
      .useValue({
        set,
        get: vi.fn(),
        del: vi.fn(),
        close: vi.fn(),
      })
      .compile();

    try {
      const sessionsService = moduleRef.get(SessionsService);

      const sessionId = await sessionsService.create('42');

      expect(set).toHaveBeenCalledWith(`session:${sessionId}`, '42', {
        EX: 3600,
      });
    } finally {
      await moduleRef.close();
    }
  });
});
