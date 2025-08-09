import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  IsIn,
  MinLength,
  IsArray,
} from 'class-validator';
import { UserModule, UserRole } from '../entities';

export class CreateUserDto {
  @IsEmail() email!: string;
  @IsString() name!: string;
  @IsString() surname!: string;
  @IsString() username!: string;
  @IsOptional() @MinLength(6) password?: string;
  @IsIn(['owner', 'admin', 'user', 'test-user']) role: UserRole = 'user';
  @IsOptional() @IsArray() settings?: { activeModules: UserModule[] };
  @IsOptional() @IsBoolean() isActive?: boolean;
}
