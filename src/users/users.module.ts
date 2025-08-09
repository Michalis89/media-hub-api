import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserModuleAccess } from './entities/user-module-access.entity';
import { UserMediaEntry } from './entities/user-media-entry.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserService } from './services/user.service';
import { UsersController } from './controllers/users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserModuleAccess, UserMediaEntry]),
    forwardRef(() => AuthModule),
  ],
  providers: [UserService],
  controllers: [UsersController],
  exports: [UserService],
})
export class UsersModule {}
