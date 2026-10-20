import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SessionsService } from './sessions.service.js';
import type { RedisService } from '../redis/redis.service.js';

describe('SessionsService', () => {
  const set = vi.fn();
  const get = vi.fn();
  const del = vi.fn();

  const service = new SessionsService({
    set,
    get,
    del,
  } as unknown as RedisService);

  beforeEach(() => {
    set.mockReset().mockResolvedValue('OK');
    get.mockReset();
    del.mockReset().mockResolvedValue(1);
  });

  it('creates a cryptographically random session with TTL', async () => {
    const sessionId = await service.create('42');

    expect(sessionId).toMatch(/^[A-Za-z0-9_-]{43}$/);

    expect(set).toHaveBeenCalledWith(`session:${sessionId}`, '42', 3600);
  });

  it('generates a new sessionId for every login', async () => {
    const first = await service.create('42');
    const second = await service.create('42');

    expect(first).not.toBe(second);
    expect(set).toHaveBeenCalledTimes(2);
  });

  it('returns userId for an existing session', async () => {
    get.mockResolvedValue('42');

    const userId = await service.getUserId('abc');

    expect(get).toHaveBeenCalledWith('session:abc');
    expect(userId).toBe('42');
  });

  it('returns null when a session does not exist', async () => {
    get.mockResolvedValue(null);

    expect(await service.getUserId('expired')).toBeNull();
  });

  it('revokes a session', async () => {
    await service.revoke('abc');

    expect(del).toHaveBeenCalledWith('session:abc');
  });

  it('does not return a sessionId when Redis write fails', async () => {
    const redisError = new Error('Redis unavailable');
    set.mockRejectedValue(redisError);

    await expect(service.create('42')).rejects.toBe(redisError);
  });

  it('does not treat Redis errors as missing sessions', async () => {
    const redisError = new Error('Redis unavailable');
    get.mockRejectedValue(redisError);

    await expect(service.getUserId('abc')).rejects.toBe(redisError);
  });
});
