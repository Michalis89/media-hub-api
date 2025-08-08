import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { MeMediaQueryDto } from './dto/me-media.query';
import { UpsertMediaDto } from './dto/upsert-media.dto';

@Controller('me')
export class MeController {
  constructor(private readonly usersService: UsersService) {}

  @Get('media')
  async getMedia(@Query() query: MeMediaQueryDto) {
    const userId = await this.usersService.getDevUserId(); // TODO: replace with auth user
    return this.usersService.findMediaForUser(userId, query);
  }

  @Post('media')
  async upsertMedia(@Body() body: UpsertMediaDto) {
    const userId = await this.usersService.getDevUserId(); // TODO: replace with auth user
    return this.usersService.upsertMediaEntry(userId, body);
  }

  @Delete('media/:id')
  async deleteMedia(@Param('id') id: string) {
    const userId = await this.usersService.getDevUserId(); // TODO: replace with auth user
    return this.usersService.deleteMediaEntry(userId, id);
  }

  @Get('media/stats')
  async getMediaStats(@Query() query: MeMediaQueryDto) {
    const userId = await this.usersService.getDevUserId(); // TODO: replace with auth user
    return this.usersService.getMediaStats(userId, query);
  }
}
