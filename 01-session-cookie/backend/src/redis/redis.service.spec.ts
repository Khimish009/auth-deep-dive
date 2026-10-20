import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RedisClientType } from 'redis';

import { RedisService } from './redis.service.js';

describe('RedisService.set', () => {
  const set = vi.fn();

  const service = new RedisService({
    set,
  } as unknown as RedisClientType);

  beforeEach(() => {
    set.mockReset();
    set.mockResolvedValue('OK');
  });

  it('sets a key with an expiration time', async () => {
    await service.set('session:abc', '42', 3600);

    expect(set).toHaveBeenCalledWith('session:abc', '42', { EX: 3600 });
  });

  it('allows a key without TTL when explicitly omitted', async () => {
    await service.set('cache:key', 'value');

    expect(set).toHaveBeenCalledWith('cache:key', 'value');
  });

  it.each([0, -1, 1.5, NaN, Infinity])(
    'rejects invalid TTL: %s',
    async (ttl) => {
      await expect(service.set('session:abc', '42', ttl)).rejects.toThrow(
        'TTL must be a positive integer',
      );

      expect(set).not.toHaveBeenCalled();
    },
  );
});
