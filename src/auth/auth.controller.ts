import {
  Controller,
  Post,
  Get,
  HttpCode,
  ForbiddenException,
  NotFoundException,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  @Post('dev-login')
  @HttpCode(200)
  async devLogin(@Res({ passthrough: true }) res: Response) {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Dev login disabled in production');
    }

    // Αν το getDevUserId είναι async, βάλ’ του await:
    const userId = this.authService.getDevUserId();
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('Dev user not found');

    const token = this.jwtService.sign({
      sub: user.id,
      roles: user.role ? [user.role] : [],
    });

    res.cookie('auth', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.COOKIE_SECURE === 'true',
      maxAge: 1000 * 60 * 60 * 24 * 30,
      path: '/',
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        display_name: user.displayName ?? null,
        role: user.role ?? null,
        roles: user.role ? [user.role] : [],
        is_active: user.isActive ?? true,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) return { user: null };

    return {
      user: {
        id: user.id,
        email: user.email,
        display_name: user.displayName ?? null,
        role: user.role ?? null,
        roles: user.role ? [user.role] : [],
        is_active: user.isActive ?? true,
      },
    };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('auth', {
      sameSite: 'lax',
      secure: process.env.COOKIE_SECURE === 'true',
      path: '/',
    });
    return { ok: true };
  }
}
