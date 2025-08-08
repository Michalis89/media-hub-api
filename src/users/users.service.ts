// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from './user.entity';
import { UserMediaEntry } from './user-media-entry.entity';
import { MeMediaQueryDto } from './dto/me-media.query';
import { UpsertMediaDto } from './dto/upsert-media.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(UserMediaEntry) private readonly mediaRepo: Repository<UserMediaEntry>
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  // προσωρινός dev user
  async getDevUserId(): Promise<string> {
    const user = await this.usersRepo.findOne({ where: { email: 'mike@example.com' } });
    if (!user) throw new Error('Dev user not found (mike@example.com)');
    return user.id;
  }

  async findMediaForUser(userId: string, query: MeMediaQueryDto) {
    const { limit = 20, offset = 0, sort = 'updated_at.desc' } = query;

    const qb = applyFilters(
      this.mediaRepo.createQueryBuilder('e').where('e.user_id = :userId', { userId }),
      query
    );

    // sorting (whitelist)
    const [col, dir] = (sort || '').split('.');
    const allowedCols = new Set([
      'updated_at',
      'created_at',
      'user_rating_10',
      'release_date',
      'title',
    ]);
    const sortCol = allowedCols.has(col || '') ? col : 'updated_at';
    const sortDir: 'ASC' | 'DESC' = dir?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const take = Math.min(Number(limit) || 20, 100);
    const skip = Math.max(Number(offset) || 0, 0);

    qb.orderBy(`e.${sortCol}`, sortDir).take(take).skip(skip);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      limit: take,
      offset: skip,
      sort: `${sortCol}.${sortDir.toLowerCase()}`,
    };
  }

  async upsertMediaEntry(userId: string, dto: UpsertMediaDto) {
    const { mediaType, externalProvider, externalId } = dto;

    const existing = await this.mediaRepo.findOne({
      where: { userId, mediaType, externalProvider, externalId },
    });

    const payload: Partial<UserMediaEntry> = {
      userId,
      mediaType: dto.mediaType,
      externalProvider: dto.externalProvider,
      externalId: dto.externalId,
      title: dto.title,
      posterUrl: dto.posterUrl ?? null,
      releaseDate: dto.releaseDate ?? null,
      userRating10: dto.userRating10 ?? null,
      status: dto.status,
      favorite: dto.favorite ?? false,
      notes: dto.notes ?? null,
      startedAt: dto.startedAt ?? null,
      finishedAt: dto.finishedAt ?? null,
    };

    if (existing) {
      Object.assign(existing, payload);
      return this.mediaRepo.save(existing);
    } else {
      const entity = this.mediaRepo.create(payload as UserMediaEntry);
      return this.mediaRepo.save(entity);
    }
  }

  async deleteMediaEntry(userId: string, id: string) {
    const res = await this.mediaRepo.delete({ id, userId });
    return { ok: res.affected === 1 };
  }

  // counts που σέβονται τα ίδια φίλτρα με /me/media
  async getMediaStats(userId: string, query: MeMediaQueryDto) {
    const base = applyFilters(
      this.mediaRepo.createQueryBuilder('e').where('e.user_id = :userId', { userId }),
      query
    );

    // total + favorites
    const row = await base
      .clone()
      .select('COUNT(*)::int', 'total')
      .addSelect('COUNT(*) FILTER (WHERE e.favorite)::int', 'fav')
      .getRawOne<{ total: number; fav: number }>();
    const { total, fav } = row ?? { total: 0, fav: 0 };

    // by media_type
    const mt = await base
      .clone()
      .select('e.media_type', 'media_type')
      .addSelect('COUNT(*)', 'cnt')
      .groupBy('e.media_type')
      .getRawMany<{ media_type: string; cnt: string }>();

    // by status
    const st = await base
      .clone()
      .select('e.status', 'status')
      .addSelect('COUNT(*)', 'cnt')
      .groupBy('e.status')
      .getRawMany<{ status: string; cnt: string }>();

    const mediaTypes = ['anime', 'movie', 'tv', 'music', 'book', 'game'];
    const statuses = ['watching', 'completed', 'on_hold', 'dropped', 'plan_to'];

    const byMediaType = Object.fromEntries(
      mediaTypes.map((t) => [t, Number(mt.find((x) => x.media_type === t)?.cnt ?? 0)])
    );
    const byStatus = Object.fromEntries(
      statuses.map((s) => [s, Number(st.find((x) => x.status === s)?.cnt ?? 0)])
    );

    return { total, favorites: fav, byMediaType, byStatus };
  }
}

/* -------------------- helpers -------------------- */

function applyFilters(qb: SelectQueryBuilder<UserMediaEntry>, query: MeMediaQueryDto) {
  const { media_type, status, favorite, q } = query;

  const mediaTypes = csv(media_type);
  if (mediaTypes.length) qb.andWhere('e.media_type IN (:...mediaTypes)', { mediaTypes });

  const statuses = csv(status);
  if (statuses.length) qb.andWhere('e.status IN (:...statuses)', { statuses });

  const fav = parseBool(favorite);
  if (fav !== null) qb.andWhere('e.favorite = :fav', { fav });

  if (q?.trim()) qb.andWhere('e.title ILIKE :q', { q: `%${q.trim()}%` });

  return qb;
}

function csv(s?: string): string[] {
  return s
    ? s
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
    : [];
}

function parseBool(v?: string): boolean | null {
  if (v === undefined) return null;
  const t = v.toLowerCase();
  if (t === 'true' || t === '1') return true;
  if (t === 'false' || t === '0') return false;
  return null;
}
