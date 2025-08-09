import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type UserRole = 'owner' | 'admin' | 'user' | 'test-user';
export type UserModule = 'movies' | 'anime' | 'tv-series' | 'books' | 'games' | 'music';

export interface UserSettings {
  activeModules: UserModule[];
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  email!: string;

  @Column({
    name: 'email_lower',
    type: 'text',
    asExpression: 'lower(email)',
    generatedType: 'STORED',
    insert: false,
    update: false,
    select: false,
  })
  emailLower?: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text' })
  surname!: string;

  @Column({ type: 'text', unique: true })
  username!: string;

  @Column({ name: 'password_hash', type: 'text', nullable: true, select: false })
  passwordHash?: string | null;

  @Column({ type: 'text', default: 'owner' })
  role!: UserRole;

  @Column({ type: 'jsonb', default: () => `'{ "activeModules": [] }'` })
  settings!: UserSettings;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'last_seen_at', type: 'timestamptz', nullable: true })
  lastSeenAt?: Date | null;

  get activeModules(): UserModule[] {
    const mods = this.settings?.activeModules;
    return Array.isArray(mods) ? mods : [];
  }
  set activeModules(mods: UserModule[]) {
    this.settings = {
      ...(this.settings ?? { activeModules: [] }),
      activeModules: mods ?? [],
    };
  }

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
