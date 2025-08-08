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

export type MediaModule = 'anime' | 'movie' | 'tv' | 'music' | 'book' | 'game';

@Entity({ name: 'user_module_access' })
@Index(['userId', 'module'], { unique: true })
export class UserModuleAccess {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'text' })
  module!: MediaModule;

  @Column({ name: 'can_read', type: 'boolean', default: true })
  canRead!: boolean;

  @Column({ name: 'can_write', type: 'boolean', default: true })
  canWrite!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
