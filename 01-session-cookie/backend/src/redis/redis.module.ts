import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient } from "redis";

@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService]
      useFactory: async (configService: ConfigService) => {
        const client = createClient({
          password: configService.getOrThrow('REDIS_PASSWORD'),
          socket: {
            host: configService.getOrThrow('REDIS_HOST'),
            port: configService.getOrThrow('REDIS_PORT')
          }
        })

        await client.connect();

        return client;
      }
    }
  ],
  exports: ['REDIS_CLIENT']
})
