import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service.js';
import { ConfigModule } from '@nestjs/config';
import { DatabaseController } from './database.controller.js';

@Module({
  imports: [ConfigModule],
  controllers: [DatabaseController],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
