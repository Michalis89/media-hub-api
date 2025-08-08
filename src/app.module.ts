import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { MalModule } from './mal/mal.module';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        console.log('DB ENV =>', {
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          pass_len: process.env.DB_PASS?.length,
          name: process.env.DB_NAME,
        });
        return {
          type: 'postgres',
          host: process.env.DB_HOST,
          port: +process.env.DB_PORT!,
          username: process.env.DB_USER,
          password: process.env.DB_PASS,
          database: process.env.DB_NAME,
          ssl: false,
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
    MalModule,
    RedisModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
