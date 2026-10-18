import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../src/database/database.module';
import { UsersService } from '../src/users/users.service';
import { DatabaseService } from '../src/database/database.service';

describe('UsersService Integration with Real PostgreSQL', () => {
  let usersService: UsersService;
  let databaseService: DatabaseService;

  // Уникальный email для теста, чтобы не поссориться с UNIQUE-placeholder в базе
  const testEmail = 'integration-test-user@example.com';
  const testPasswordHash = '$argon2id$v=19$m=65536,t=3,p=4$somefakesalthash';

  beforeAll(async () => {
    // Собираем модуль тестирования с реальными зависимостями
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }), // Подгружает реальный .env
        DatabaseModule,
      ],
      providers: [UsersService],
    }).compile();

    usersService = moduleFixture.get<UsersService>(UsersService);
    databaseService = moduleFixture.get<DatabaseService>(DatabaseService);
  });

  // Гарантированная очистка базы после выполнения теста
  afterAll(async () => {
    if (databaseService) {
      // Вычищаем созданного тестового пользователя, чтобы база осталась чистой
      await databaseService.query('DELETE FROM users WHERE email = $1', [
        testEmail,
      ]);
    }
  });

  it('should successfully insert a user and return the expected fields (without password_hash)', async () => {
    // 1. Вызываем наш реальный метод создания
    const createdUser = await usersService.create(testEmail, testPasswordHash);

    // 2. Проверяем возвращенные поля согласно ТЗ
    expect(createdUser).toBeDefined();

    // id должен прийти как строка (из-за BIGINT нюанса PostgreSQL)
    expect(typeof createdUser.id).toBe('string');

    expect(createdUser.email).toBe(testEmail);

    // Проверяем, что даты создались автоматически базой данных
    expect(createdUser.created_at).toBeInstanceOf(Date);
    expect(createdUser.updated_at).toBeInstanceOf(Date);

    // 3. Главная проверка безопасности из ТЗ: поле password_hash должно отсутствовать!
    // Используем cast к any, чтобы TypeScript разрешил проверить отсутствие свойства
    expect((createdUser as any).password_hash).toBeUndefined();
    expect((createdUser as any).password).toBeUndefined();
  });
});
