import { Injectable, Logger } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  JWT_EXPIRES_IN,
  JWT_SECRET,
} from './constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  validateUser(username: string, password: string): boolean {
    const isValid = username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
    if (isValid) {
      this.logger.log(`管理员登录成功: ${username}`);
    } else {
      this.logger.warn(`管理员登录失败: 用户名 ${username}`);
    }
    return isValid;
  }

  login(username: string): { token: string; username: string } {
    const token = jwt.sign({ username }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    return { token, username };
  }

  getProfile(username: string): { username: string } {
    return { username };
  }
}
