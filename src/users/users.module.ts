import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserModuleAccess } from './user-module-access.entity';
import { UserMediaEntry } from './user-media-entry.entity';
import { UsersService } from './users.service';
import { MeController } from './me.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserModuleAccess, UserMediaEntry]),
    forwardRef(() => AuthModule),
  ],
  providers: [UsersService],
  controllers: [MeController],
  exports: [UsersService],
})
export class UsersModule {}
