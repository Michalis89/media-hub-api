// src/users/dto/me-media.query.ts
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class MeMediaQueryDto {
  @IsOptional()
  @IsString()
  media_type?: string; // csv: anime,movie

  @IsOptional()
  @IsString()
  status?: string; // csv: watching,completed

  @IsOptional()
  @IsString()
  favorite?: string; // "true" | "false" | "1" | "0"

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  offset?: number;

  @IsOptional()
  @IsString()
  sort?: string; // e.g. "user_rating_10.desc"
}
