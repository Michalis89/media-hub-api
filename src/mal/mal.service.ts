// src/mal/mal.service.ts
import { Injectable, HttpException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RedisService } from 'src/redis/redis.service';

const MAL_FIELDS =
  'id,title,main_picture,alternative_titles,num_episodes,average_episode_duration,start_date,mean';

const MAX_OFFSET = 500; // προαιρετικό όριο ασφαλείας

function norm(s?: string) {
  return (s || '').toLowerCase().normalize('NFKC').trim();
}
function matchesQuery(node: any, q: string) {
  const hay = [
    norm(node.title),
    norm(node.alternative_titles?.en),
    norm(node.alternative_titles?.ja),
    ...(node.alternative_titles?.synonyms || []).map(norm),
  ].join(' ');
  const tokens = norm(q).split(/\s+/).filter(Boolean);
  return tokens.every((tok) => hay.includes(tok));
}

@Injectable()
export class MalService {
  private readonly base = 'https://api.myanimelist.net/v2';
  private readonly logger = new Logger(MalService.name);

  constructor(private readonly http: HttpService, private readonly redis: RedisService) {}

  async searchAnime(q: string, limit = 10, offset = 0) {
    q = (q ?? '').trim();
    const lim = Math.max(1, Math.min(Number(limit) || 10, 20));
    const off = Math.max(0, Number(offset) || 0);

    const cacheKey = this.key('search', q.toLowerCase(), lim, off);

    return this.cached(
      cacheKey,
      async () => {
        try {
          const res$ = this.http.get(`${this.base}/anime`, {
            params: { q, limit: lim, offset: off, fields: MAL_FIELDS },
            headers: { 'X-MAL-CLIENT-ID': process.env.MAL_CLIENT_ID! },
          });
          const { data } = await firstValueFrom(res$);

          const rawNodes = (data?.data ?? []).map((x: any) => x.node);
          const items = rawNodes.filter((n) => matchesQuery(n, q));

          const providerNextUrl: string | undefined = data?.paging?.next;
          const providerNextOffset = providerNextUrl
            ? Number(new URL(providerNextUrl).searchParams.get('offset'))
            : null;

          const hasMore = providerNextOffset !== null && providerNextOffset <= MAX_OFFSET;
          const nextOffset = hasMore ? providerNextOffset : null;

          return {
            items,
            nextOffset,
            hasMore,
            meta: {
              requested: { q, limit: lim, offset: off },
              provider: { providerNextOffset },
              counts: { raw: rawNodes.length, filtered: items.length },
            },
          };
        } catch (e: any) {
          const status = e?.response?.status ?? 502;
          const body = e?.response?.data ?? { message: 'MAL upstream error' };
          if (status === 429) body.message = 'Rate limited by MAL. Please try again shortly.';
          this.logger.warn(`MAL search failed (q="${q}", off=${off}) status=${status}`);
          throw new HttpException(body, status);
        }
      },
      3600
    );
  }

  async getAnimeById(id: number) {
    const cacheKey = this.key('anime', id);
    return this.cached(
      cacheKey,
      async () => {
        const res$ = this.http.get(`${this.base}/anime/${id}`, {
          params: { fields: MAL_FIELDS },
          headers: { 'X-MAL-CLIENT-ID': process.env.MAL_CLIENT_ID! },
        });
        const { data } = await firstValueFrom(res$);
        return data;
      },
      86400
    ); // 24h TTL για σταθερά metadata
  }

  async purgeAnimeById(id: number) {
    await this.redis.del(this.key('anime', id));
    return { ok: true };
  }

  async purgeSearch(q: string) {
    const normQ = (q ?? '').trim().toLowerCase();
    const pattern = `${this.key('search', normQ)}:*`; // mal:search:<q>:*
    const deleted = await this.redis.delPattern(pattern);
    return { ok: true, deleted };
  }

  private key(...parts: (string | number)[]) {
    return ['mal', ...parts].join(':');
  }

  private async cached<T>(key: string, producer: () => Promise<T>, ttl = 3600): Promise<T> {
    const hit = await this.redis.get<T>(key);
    if (hit) {
      this.logger.debug(`cache hit: ${key}`);
      return hit;
    }
    const val = await producer();
    await this.redis.set(key, val, ttl);
    return val;
  }
}
