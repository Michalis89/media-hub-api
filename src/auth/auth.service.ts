import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  getDevUserId(): string {
    const id = process.env.DEV_USER_ID;
    if (!id) throw new Error('DEV_USER_ID is not set');
    return id;
  }
}
