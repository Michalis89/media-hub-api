import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MalService } from './mal.service';
import { MalController } from './mal.controller';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [HttpModule.register({ timeout: 5000, maxRedirects: 0 }), RedisModule],
  controllers: [MalController],
  providers: [MalService],
})
export class MalModule {}
