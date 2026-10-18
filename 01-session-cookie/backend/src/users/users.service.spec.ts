import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UsersService } from './users.service.js';
import type { DatabaseService } from '../database/database.service.js';

describe('UsersService.findByEmail', () => {
  const query = vi.fn();

  const usersService = new UsersService({
    query,
  } as unknown as DatabaseService);

  beforeEach(() => {
    query.mockReset();
  });

  it('returns a user with password_hash', async () => {
    const user = {
      id: '1',
      email: 'test@example.com',
      password_hash: '$argon2id$example',
      created_at: new Date(),
      updated_at: new Date(),
    };

    query.mockResolvedValue({ rows: [user] });

    const result = await usersService.findByEmail(user.email);

    expect(result).toEqual(user);
    expect(query).toHaveBeenCalledOnce();

    const [sql, params] = query.mock.calls[0] as [string, unknown[]];

    expect(sql).toMatch(/\bFROM\s+users\b/i);
    expect(sql).toMatch(/\bpassword_hash\b/i);
    expect(sql).toMatch(/\$1\b/);
    expect(params).toEqual([user.email]);
  });

  it('returns null when email does not exist', async () => {
    query.mockResolvedValue({ rows: [] });

    const result = await usersService.findByEmail('unknown@example.com');

    expect(result).toBeNull();
  });
});
