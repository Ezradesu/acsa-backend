import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class CatalogCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CatalogCacheService.name);
  private client: RedisClientType | null = null;
  private readonly prefix: string;
  private readonly ttlSeconds: number;

  constructor(private readonly config: ConfigService) {
    this.prefix = config.get<string>('CACHE_PREFIX') ?? 'acsa';
    this.ttlSeconds = Math.max(
      Number(config.get<string>('CACHE_TTL_SECONDS') ?? 300),
      1,
    );
  }

  async onModuleInit(): Promise<void> {
    const url = this.config.get<string>('REDIS_URL');
    if (!url) {
      this.logger.warn('REDIS_URL kosong. Cache katalog dinonaktifkan.');
      return;
    }

    const client = createClient({
      url,
      socket: {
        connectTimeout: 2000,
        reconnectStrategy: (retries) =>
          retries >= 3 ? false : Math.min(retries * 100, 1000),
      },
    });
    client.on('error', (error: Error) => {
      this.logger.warn(`Koneksi Redis bermasalah: ${error.message}`);
    });

    try {
      await client.connect();
      this.client = client as RedisClientType;
      this.logger.log('Cache katalog terhubung ke Redis.');
    } catch (error) {
      this.logger.warn(
        `Redis tidak dapat dihubungi. Cache dilewati: ${this.errorMessage(error)}`,
      );
      client.destroy();
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client?.isOpen) await this.client.close();
  }

  async get<T>(scope: string, identity: unknown): Promise<T | null> {
    if (!this.client?.isReady) return null;

    try {
      const key = await this.key(scope, identity);
      const cached = await this.client.get(key);
      return cached ? (JSON.parse(cached) as T) : null;
    } catch (error) {
      this.logger.warn(`Gagal membaca cache: ${this.errorMessage(error)}`);
      return null;
    }
  }

  async set(scope: string, identity: unknown, value: unknown): Promise<void> {
    if (!this.client?.isReady) return;

    try {
      const key = await this.key(scope, identity);
      await this.client.set(key, JSON.stringify(value), {
        expiration: { type: 'EX', value: this.ttlSeconds },
      });
    } catch (error) {
      this.logger.warn(`Gagal menulis cache: ${this.errorMessage(error)}`);
    }
  }

  async invalidateCatalog(): Promise<void> {
    if (!this.client?.isReady) return;

    try {
      await this.client.incr(this.versionKey());
    } catch (error) {
      this.logger.warn(
        `Gagal mengganti versi cache: ${this.errorMessage(error)}`,
      );
    }
  }

  private async key(scope: string, identity: unknown): Promise<string> {
    const version = await this.catalogVersion();
    const digest = createHash('sha256')
      .update(this.stableStringify(identity))
      .digest('hex');
    return `${this.prefix}:catalog:v${version}:${scope}:${digest}`;
  }

  private async catalogVersion(): Promise<string> {
    if (!this.client) return '1';
    const key = this.versionKey();
    const current = await this.client.get(key);
    if (current) return current;
    await this.client.set(key, '1', { condition: 'NX' });
    return (await this.client.get(key)) ?? '1';
  }

  private versionKey(): string {
    return `${this.prefix}:catalog:version`;
  }

  private stableStringify(value: unknown): string {
    if (Array.isArray(value)) {
      return `[${value.map((item) => this.stableStringify(item)).join(',')}]`;
    }
    if (value && typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(
          ([key, item]) =>
            `${JSON.stringify(key)}:${this.stableStringify(item)}`,
        );
      return `{${entries.join(',')}}`;
    }
    return JSON.stringify(value) ?? 'undefined';
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
