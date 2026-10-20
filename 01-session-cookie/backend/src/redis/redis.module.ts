import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { RedisService } from './redis.service.js';
import { parsePort } from '../common/config/parse-port.js';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const port = parsePort(configService.getOrThrow('REDIS_PORT'), 'REDIS');
        const logger = new Logger('RedisClient');

        const client = createClient({
          password: configService.getOrThrow('REDIS_PASSWORD'),
          socket: {
            host: configService.getOrThrow('REDIS_HOST'),
            port,
          },
        });

        client.on('error', (err) => {
          logger.error(`Redis client error: ${err.message}`, err.stask);
        });

        await client.connect();

        return client;
      },
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
