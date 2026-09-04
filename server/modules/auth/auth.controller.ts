import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { AdminLoginRequest, AdminLoginResponse } from '@shared/api.interface';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('api/admin')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: AdminLoginRequest): AdminLoginResponse {
    const { username, password } = body;
    const isValid = this.authService.validateUser(username, password);
    if (!isValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    return this.authService.login(username);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: { user: { username: string } }): { username: string } {
    return this.authService.getProfile(req.user.username);
  }
}
