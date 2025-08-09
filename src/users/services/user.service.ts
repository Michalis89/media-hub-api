import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserModule } from '../entities';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepo.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async create(dto: CreateUserDto) {
    try {
      const allowed = new Set<UserModule>([
        'movies',
        'anime',
        'tv-series',
        'books',
        'games',
        'music',
      ]);
      const activeModules = dto.settings?.activeModules?.filter((m) => allowed.has(m)) ?? [];

      const passwordHash = await this.hashPassword(dto.password);

      const user = this.usersRepo.create({
        email: dto.email,
        name: dto.name,
        surname: dto.surname,
        username: dto.username,
        passwordHash,
        role: 'user',
        isActive: true,
        settings: { activeModules },
        avatarUrl: dto.avatarUrl?.trim() || null,
      });

      const saved = await this.usersRepo.save(user);
      const { passwordHash: _, ...safe } = saved;
      return safe;
    } catch (err: any) {
      if (err?.code === '23505') {
        throw new ConflictException('Username or email already exists');
      }
      throw new InternalServerErrorException();
    }
  }

  async update(id: string, dto: UpdateUserDto) {
    const partial: any = { ...dto };
    if (dto.password) {
      partial.passwordHash = await bcrypt.hash(dto.password, 10);
      delete partial.password;
    }

    const entity = await this.usersRepo.preload({ id, ...partial });
    if (!entity) return null;

    return this.usersRepo.save(entity);
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepo
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.emailLower = :emailLower', { emailLower: email.toLowerCase() })
      .getOne();
  }

  async findByUsernameWithPassword(username: string): Promise<User | null> {
    return this.usersRepo
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.username = :username', { username })
      .getOne();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.usersRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  private async hashPassword(plain: string) {
    return bcrypt.hash(plain, 10);
  }
}
