import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import * as argon2 from 'argon2';

import { AuthService } from './auth.service.js';
import type { UsersService } from '../users/users.service.js';

describe('AuthService.validateCredentials', () => {
  const findByEmail = vi.fn();

  const authService = new AuthService({
    findByEmail,
  } as unknown as UsersService);

  const password = 'StrongPassword123!';
  let passwordHash: string;

  const publicUser = {
    id: '1',
    email: 'test@example.com',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeAll(async () => {
    passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });
  });

  beforeEach(() => {
    findByEmail.mockReset();
  });

  it('authenticates a user with a valid password', async () => {
    findByEmail.mockResolvedValue({
      ...publicUser,
      password_hash: passwordHash,
    });

    const result = await authService.validateCredentials(
      '  TEST@EXAMPLE.COM  ',
      password,
    );

    expect(findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(result).toEqual(publicUser);
    expect(result).not.toHaveProperty('password_hash');
  });

  it('returns 401 when the user does not exist', async () => {
    findByEmail.mockResolvedValue(null);

    await expect(
      authService.validateCredentials('missing@example.com', password),
    ).rejects.toMatchObject({
      status: 401,
      response: {
        message: 'Invalid email or password',
      },
    });
  });

  it('returns the same 401 error for an incorrect password', async () => {
    findByEmail.mockResolvedValue({
      ...publicUser,
      password_hash: passwordHash,
    });

    await expect(
      authService.validateCredentials('test@example.com', 'WrongPassword123!'),
    ).rejects.toMatchObject({
      status: 401,
      response: {
        message: 'Invalid email or password',
      },
    });
  });

  it('propagates database errors instead of returning 401', async () => {
    const databaseError = Object.assign(new Error('Connection refused'), {
      code: 'ECONNREFUSED',
    });

    findByEmail.mockRejectedValue(databaseError);

    await expect(
      authService.validateCredentials('test@example.com', password),
    ).rejects.toBe(databaseError);
  });
});
