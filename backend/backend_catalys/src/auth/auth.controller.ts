import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: { nip: string; password: string }) {
    return this.authService.login(loginDto.nip, loginDto.password);
  }

  @Post('flutter-login')
  @HttpCode(HttpStatus.OK)
  async flutterLogin(@Body() loginDto: { nip: string; password: string }) {
    return this.authService.flutterLogin(loginDto.nip, loginDto.password);
  }
}