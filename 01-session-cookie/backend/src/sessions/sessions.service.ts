import { randomBytes } from 'crypto';
import { RedisService } from '../redis/redis.service.js';

export class SessionsService {
  constructor(private readonly redis: RedisService) {}

  async create(userId: string): Promise<string> {
    const sessionId = randomBytes(32).toString('base64url');

    await this.redis.set(this.getSessionKey(sessionId), userId, 3600);

    return sessionId;
  }

  async getUserId(sessionId: string): Promise<string | null> {
    const userId = await this.redis.get(this.getSessionKey(sessionId));

    if (!userId) {
      return null;
    }

    return userId;
  }

  async revoke(sessionId: string): Promise<void> {
    await this.redis.del(this.getSessionKey(sessionId));
  }

  private getSessionKey(session: string) {
    return `session:${session}`;
  }
}
