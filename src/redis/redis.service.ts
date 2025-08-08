import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private readonly ttl: number;

  constructor(
    @Inject(REDIS_CLIENT) private readonly client: Redis,
    private readonly config: ConfigService
  ) {
    this.ttl = Number(this.config.get('REDIS_TTL_SECONDS') ?? 21600);
  }

  async onModuleInit() {
    try {
      const pong = await this.client.ping();
      this.logger.log(`Connected to Redis: ${pong}`);
    } catch (err) {
      this.logger.error('Failed to connect to Redis', err);
    }
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set(key: string, value: unknown, ttlSeconds = this.ttl): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async delPattern(pattern: string): Promise<number> {
    let cursor = '0';
    let total = 0;
    do {
      const [next, keys] = await (this as any).client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        '100'
      );
      cursor = next;
      if (keys.length) {
        total += await (this as any).client.del(...keys);
      }
    } while (cursor !== '0');
    return total;
  }
}
