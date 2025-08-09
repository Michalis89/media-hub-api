import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsArray,
  ArrayUnique,
  IsIn,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { UserModule } from '../entities/user.entity';

const USER_MODULES: UserModule[] = ['movies', 'anime', 'tv-series', 'books', 'games', 'music'];

class UserSettingsDto {
  @IsArray()
  @ArrayUnique()
  @IsIn(USER_MODULES, { each: true })
  activeModules!: UserModule[];
}

export class CreateUserDto {
  @IsEmail() email!: string;
  @IsString() name!: string;
  @IsString() surname!: string;
  @IsString() username!: string;

  @MinLength(6)
  password!: string; // για register required

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserSettingsDto)
  settings?: UserSettingsDto;
}
