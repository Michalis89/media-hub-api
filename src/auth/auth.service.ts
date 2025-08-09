import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/users/services/user.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwt: JwtService
  ) {}

  async validateUser(identifier: string, password: string) {
    const byEmail = identifier.includes('@');

    const user = byEmail
      ? await this.userService.findByEmailWithPassword(identifier)
      : await this.userService.findByUsernameWithPassword(identifier);

    if (!user?.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const { passwordHash, ...safe } = user as any;
    return safe;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    const payload = { sub: user.id, username: user.username, role: user.role };
    return {
      access_token: await this.jwt.signAsync(payload),
      user,
    };
  }

  async getProfile(userId: string) {
    return this.userService.findOne(userId);
  }
}
