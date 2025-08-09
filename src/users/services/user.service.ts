import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities';
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

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.usersRepo.create({
      ...dto,
      passwordHash: dto.password ? await bcrypt.hash(dto.password, 10) : null,
    });
    try {
      return await this.usersRepo.save(user);
    } catch (e: any) {
      if (e.code === '23505') {
        throw new ConflictException('Email or username already exists');
      }
      throw e;
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
}
