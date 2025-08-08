import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export type MediaType = 'anime' | 'movie' | 'tv' | 'music' | 'book' | 'game';
export type EntryStatus = 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to';

@Entity({ name: 'user_media_entry' })
@Index(['userId', 'mediaType', 'externalProvider', 'externalId'], { unique: true })
@Index(['userId', 'updatedAt'])
export class UserMediaEntry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'media_type', type: 'text' })
  mediaType!: MediaType;

  @Column({ name: 'external_provider', type: 'text' })
  externalProvider!: string;

  @Column({ name: 'external_id', type: 'text' })
  externalId!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ name: 'poster_url', type: 'text', nullable: true })
  posterUrl?: string | null;

  @Column({ name: 'release_date', type: 'date', nullable: true })
  releaseDate?: string | null; // ISO date string (YYYY-MM-DD)

  @Column({
    name: 'user_rating_10',
    type: 'numeric',
    precision: 3,
    scale: 1,
    nullable: true,
    transformer: {
      to: (v: number | null) => v,
      from: (v: string | null) => (v === null ? null : Number(v)),
    },
  })
  userRating10?: number | null;

  @Column({ type: 'text' })
  status!: EntryStatus;

  @Column({ type: 'boolean', default: false })
  favorite!: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ name: 'started_at', type: 'date', nullable: true })
  startedAt?: string | null;

  @Column({ name: 'finished_at', type: 'date', nullable: true })
  finishedAt?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
