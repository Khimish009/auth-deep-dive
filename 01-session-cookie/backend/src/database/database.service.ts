import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Pool, QueryResult, QueryResultRow } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly configService: ConfigService) {
    const rawPort = this.configService.getOrThrow('DB_PORT');

    this.pool = new Pool({
      host: this.configService.getOrThrow<string>('DB_HOST'),
      port: this.parseAndValidatePort(rawPort),
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

  private parseAndValidatePort(portStr: string) {
    const port = Number(portStr);

    if (
      Number.isNaN(port) ||
      !Number.isInteger(port) ||
      port < 1 ||
      port > 65535
    ) {
      throw new Error(
        'Invalid DB_PORT: expected an integer between 1 and 65535',
      );
    }

    return port;
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async health(): Promise<void> {
    await this.pool.query('SELECT 1');
  }

  async query<T extends QueryResultRow = any>(
    queryText: string,
    params: any[],
  ): Promise<QueryResult<T>> {
    return await this.pool.query(queryText, params);
  }
}
