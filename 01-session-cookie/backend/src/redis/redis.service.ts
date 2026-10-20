import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { type RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
  ) {}

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<string | null> {
    if (ttl !== undefined) {
      if (!Number.isInteger(ttl) || ttl <= 0) {
        throw new Error('TTL must be a positive integer');
      }

      return await this.redis.set(key, value, { EX: ttl });
    }
    return await this.redis.set(key, value);
  }

  async del(key: string): Promise<number> {
    return await this.redis.del(key);
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.close();
  }
}
