import { describe, expect, it } from 'vitest';
import * as argon2 from 'argon2';
import { DUMMY_PASSWORD_HASH } from './constants.js';

describe('Dummy password hash', () => {
  it('contains a valid Argon2id hash', async () => {
    const result = await argon2.verify(
      DUMMY_PASSWORD_HASH,
      'dummy-password-not-used-for-login',
    );

    expect(result).toBe(true);
  });

  it('rejects a different password', async () => {
    const result = await argon2.verify(
      DUMMY_PASSWORD_HASH,
      'WrongPassword123!',
    );

    expect(result).toBe(false);
  });
});
