import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { EntryStatus, MediaType } from '../entities/user-media-entry.entity';

export class UpsertMediaDto {
  @IsIn(['anime', 'movie', 'tv', 'music', 'book', 'game'])
  mediaType!: MediaType;

  @IsString()
  externalProvider!: string;

  @IsString()
  externalId!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  posterUrl?: string;

  @IsOptional()
  @IsDateString()
  releaseDate?: string; // YYYY-MM-DD

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(10)
  userRating10?: number;

  @IsIn(['watching', 'completed', 'on_hold', 'dropped', 'plan_to'])
  status!: EntryStatus;

  @IsOptional()
  @IsBoolean()
  favorite?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  finishedAt?: string;
}
