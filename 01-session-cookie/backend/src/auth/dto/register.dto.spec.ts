import { describe, it, expect } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto } from './register.dto.js';

// Вспомогательная функция, чтобы не дублировать код валидации
async function getValidationErrors(plainObject: Record<string, unknown>) {
  // 1. Превращаем обычный JS-объект в экземпляр класса DTO
  const dtoInstance = plainToInstance(RegisterDto, plainObject);
  // 2. Валидируем этот экземпляр и возвращаем массив ошибок
  return await validate(dtoInstance, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
}

describe('RegisterDto Validation', () => {
  // Кейс 1: Корректные данные
  it('should pass with valid data', async () => {
    const validData = {
      email: 'test@example.com',
      password: 'strongpassword123',
    };

    const errors = await getValidationErrors(validData);
    expect(errors.length).toBe(0); // Ошибок быть не должно
  });

  // Кейс 2: Числовой email
  it('should fail when email is a number', async () => {
    const invalidData = {
      email: 12345, // Передаем число вместо строки-email
      password: 'strongpassword123',
    };

    const errors = await getValidationErrors(invalidData);
    expect(errors.length).toBeGreaterThan(0); // Должна быть ошибка

    // Проверяем, что ошибка указывает именно на поле email
    const emailError = errors.find((err) => err.property === 'email');
    expect(emailError).toBeDefined();
  });

  // Кейс 3: null вместо пароля
  it('should fail when password is null', async () => {
    const invalidData = {
      email: 'test@example.com',
      password: null, // Передаем null вместо пароля
    };

    const errors = await getValidationErrors(invalidData);
    expect(errors.length).toBeGreaterThan(0);

    const passwordError = errors.find((err) => err.property === 'password');
    expect(passwordError).toBeDefined();
  });

  // Кейс 4: Дополнительное поле role: "admin"
  it('should fail when extra fields are provided (whitelist check)', async () => {
    const dataWithExtraField = {
      email: 'test@example.com',
      password: 'strongpassword123',
      role: 'admin', // Запрещенное поле, которого нет в DTO
    };

    const errors = await getValidationErrors(dataWithExtraField);
    expect(errors.length).toBeGreaterThan(0);

    const roleError = errors.find((err) => err.property === 'role');
    expect(roleError).toBeDefined();
  });
});
