import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, QueryResultRow, types } from 'pg';
import { SCHEMA_SQL } from './schema';

/**
 * Thin wrapper around a pg connection pool (like *sql.DB in Go).
 * Repositories write plain SQL and call query().
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;

  constructor(config: ConfigService) {
    // 1082 = DATE. Keep it as the string 'YYYY-MM-DD' instead of a JS Date (avoids timezone shifts).
    types.setTypeParser(1082, (value: string) => value);

    this.pool = new Pool({
      host: config.get<string>('DB_HOST', 'localhost'),
      port: Number(config.get('DB_PORT', 5432)),
      user: config.get<string>('DB_USER', 'postgres'),
      password: config.get<string>('DB_PASSWORD', 'postgres'),
      database: config.getOrThrow<string>('DB_NAME'),
    });
  }

  /** Creates tables on startup if they do not exist yet. */
  async onModuleInit() {
    await this.pool.query(SCHEMA_SQL);
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  /** Runs one SQL statement with $1, $2... placeholders and returns the rows. */
  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params: unknown[] = [],
  ): Promise<T[]> {
    const result = await this.pool.query<T>(sql, params);
    return result.rows;
  }
}
