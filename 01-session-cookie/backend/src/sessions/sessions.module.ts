import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service.js';
import { RedisModule } from '../redis/redis.module.js';

@Module({
  imports: [RedisModule],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
