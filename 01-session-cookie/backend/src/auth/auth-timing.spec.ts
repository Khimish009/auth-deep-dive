import { beforeEach, describe, expect, it, vi } from 'vitest';
import argon2 from 'argon2';

import { AuthService } from './auth.service.js';
import type { UsersService } from '../users/users.service.js';

vi.mock('argon2', () => ({
  default: {
    hash: vi.fn(),
    verify: vi.fn(),
  },
}));

describe('AuthService — enumeration protection', () => {
  const findByEmail = vi.fn();
  const verify = vi.mocked(argon2.verify);

  const service = new AuthService({
    findByEmail,
  } as unknown as UsersService);

  beforeEach(() => {
    findByEmail.mockReset();
    verify.mockReset();
  });

  it('performs Argon2 verification when user is missing', async () => {
    findByEmail.mockResolvedValue(null);
    verify.mockResolvedValue(false);

    await expect(
      service.validateCredentials('missing@example.com', 'WrongPassword123!'),
    ).rejects.toMatchObject({ status: 401 });

    expect(verify).toHaveBeenCalledOnce();

    const [hash, password] = verify.mock.calls[0];

    expect(hash).toMatch(/^\$argon2id\$/);
    expect(password).toBe('WrongPassword123!');
  });

  it('uses the real stored hash when user exists', async () => {
    const storedHash = '$argon2id$stored-example';

    findByEmail.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      password_hash: storedHash,
    });

    verify.mockResolvedValue(false);

    await expect(
      service.validateCredentials('test@example.com', 'WrongPassword123!'),
    ).rejects.toMatchObject({ status: 401 });

    expect(verify).toHaveBeenCalledWith(storedHash, 'WrongPassword123!');
  });

  it('never authenticates a missing user even if verify returns true', async () => {
    findByEmail.mockResolvedValue(null);
    verify.mockResolvedValue(true);

    await expect(
      service.validateCredentials(
        'missing@example.com',
        'dummy-password-not-used-for-login',
      ),
    ).rejects.toMatchObject({ status: 401 });
  });
});
