import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const data = await this.authService.register(dto);
    this.setRefreshCookie(res, data.refreshToken);
    return { accessToken: data.accessToken, user: data.user };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const data = await this.authService.login(dto);
    this.setRefreshCookie(res, data.refreshToken);
    return { accessToken: data.accessToken, user: data.user };
  }

  @Post('refresh')
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies?.refresh_token;
    const payload: any = this.authService.decodeRefreshToken(refreshToken);
    return this.authService.refreshTokens(payload.sub, refreshToken);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      const payload: any = this.authService.decodeRefreshToken(refreshToken);
      await this.authService.logout(payload.sub);
    }
    res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
    return { success: true };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const data = await this.authService.loginWithOAuth(req.user);
    this.setRefreshCookie(res, data.refreshToken);
    return res.redirect(`${process.env.FRONTEND_WEB_URL || 'http://localhost:3000'}/oauth-success?token=${encodeURIComponent(data.accessToken)}`);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {}

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookCallback(@Req() req: any, @Res() res: Response) {
    const data = await this.authService.loginWithOAuth(req.user);
    this.setRefreshCookie(res, data.refreshToken);
    return res.redirect(`${process.env.FRONTEND_WEB_URL || 'http://localhost:3000'}/oauth-success?token=${encodeURIComponent(data.accessToken)}`);
  }

  private setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
