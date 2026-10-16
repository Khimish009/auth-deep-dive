import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { DatabaseService } from './database.service.js';

@Controller()
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('/health/db')
  async getHealth(): Promise<{ status: string; database: string }> {
    try {
      await this.databaseService.health();

      return {
        status: 'ok',
        database: 'connected',
      };
    } catch {
      throw new ServiceUnavailableException();
    }
  }
}
