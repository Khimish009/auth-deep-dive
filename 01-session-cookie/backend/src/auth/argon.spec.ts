import { describe, it, expect } from 'vitest';
import * as argon2 from 'argon2';

describe('Argon2 Password Hashing', () => {
  const password = 'StrongPassword123!';

  it('should hash a password and verify it successfully', async () => {
    // 1. Хешируем пароль с алгоритмом Argon2id (он используется по умолчанию)
    const hash = await argon2.hash(password);

    // 2. Проверяем этот же пароль против полученного хеша
    const isMatch = await argon2.verify(hash, password);

    expect(isMatch).toBe(true); // Результат должен быть true
  });

  // Сценарий 2: Проверка неправильного пароля
  it('should return false for an incorrect password', async () => {
    const hash = await argon2.hash(password);

    // Проверяем совершенно другой пароль
    const isMatch = await argon2.verify(hash, 'WrongPassword123');

    expect(isMatch).toBe(false); // Результат должен быть false
  });

  // Сценарий 3: Уникальность хешей (Соль)
  it('should generate different hashes for the same password, but both must be valid', async () => {
    // Хешируем один и тот же пароль два раза подряд
    const hash1 = await argon2.hash(password);
    const hash2 = await argon2.hash(password);

    // Проверяем, что строки хешей уникальны и не равны друг другу
    expect(hash1).not.toBe(hash2);

    // При этом оба хеша должны успешно проходить проверку с исходным паролем
    const isMatch1 = await argon2.verify(hash1, password);
    const isMatch2 = await argon2.verify(hash2, password);

    expect(isMatch1).toBe(true);
    expect(isMatch2).toBe(true);
  });
});
