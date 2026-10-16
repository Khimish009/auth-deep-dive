import { Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService {
  private readonly pool: Pool;
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly configService: ConfigService) {
    this.pool = new Pool({
      host: this.configService.getOrThrow<string>('DB_HOST'),
      port: Number(this.configService.getOrThrow('DB_PORT')) || 5433,
      user: this.configService.getOrThrow<string>('DB_USER'),
      password: this.configService.getOrThrow<string>('DB_PASSWORD'),
      database: this.configService.getOrThrow<string>('DB_NAME'),
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      maxLifetimeSeconds: 60,
    });

    this.pool.on('error', (err) => {
      this.logger.error('Unexpected error on idle database client', err.stack);
    });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async health(): Promise<void> {
    await this.pool.query('SELECT 1');
  }
}
