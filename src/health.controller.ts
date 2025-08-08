import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RedisService } from './redis/redis.service';

@Controller()
export class HealthController {
  constructor(private readonly dataSource: DataSource, private readonly redis: RedisService) {}

  @Get('/healthz')
  async health() {
    await this.dataSource.query('SELECT 1');
    return { ok: true };
  }

  @Get('healthz/redis')
  async redisHealth() {
    const key = 'health:redis:ts';
    await this.redis.set(key, { ts: Date.now() }, 10); // TTL 10s
    const val = await this.redis.get<{ ts: number }>(key);
    return { ok: !!val, val };
  }
}
