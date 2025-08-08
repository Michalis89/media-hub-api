// src/mal/mal.controller.ts
import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { MalService } from './mal.service';

@Controller('providers/mal/anime')
export class MalController {
  constructor(private readonly mal: MalService) {}

  @Get('search')
  async search(@Query('q') q: string, @Query('limit') limit = '10', @Query('offset') offset = '0') {
    if (!q?.trim()) throw new BadRequestException('Query param "q" is required');
    return this.mal.searchAnime(q, Number(limit), Number(offset));
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.mal.getAnimeById(id);
  }

  @Delete('cache/search')
  purgeSearch(@Query('q') q: string) {
    return this.mal.purgeSearch(q);
  }

  @Delete('cache/:id')
  purgeById(@Param('id', ParseIntPipe) id: number) {
    return this.mal.purgeAnimeById(id);
  }
}
