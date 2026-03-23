import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) throw new BadRequestException('E-mail já cadastrado');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, phone: dto.phone, passwordHash },
    });

    return this.generateTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user?.passwordHash) throw new UnauthorizedException('Credenciais inválidas');
    const matches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matches) throw new UnauthorizedException('Credenciais inválidas');
    return this.generateTokens(user.id, user.email, user.role);
  }

  async loginWithOAuth(profile: { email: string; name: string; provider: string; providerId: string }) {
    if (!profile.email) throw new BadRequestException('OAuth sem e-mail retornado pelo provedor');
    let user = await this.prisma.user.findUnique({ where: { email: profile.email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name: profile.name,
          email: profile.email,
          provider: profile.provider,
          providerId: profile.providerId,
          role: 'CUSTOMER',
        },
      });
    }
    return this.generateTokens(user.id, user.email, user.role);
  }

  async storeRefreshToken(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: hash } });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.refreshTokenHash) throw new UnauthorizedException('Refresh token inválido');
    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) throw new UnauthorizedException('Refresh token inválido');
    return this.generateTokens(user.id, user.email, user.role);
  }

  async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: null } });
    return { success: true };
  }

  decodeRefreshToken(token: string) {
    return this.jwtService.verify(token, { secret: process.env.JWT_REFRESH_SECRET || 'superrefreshsecret' });
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const accessToken = this.jwtService.sign(payload, { secret: process.env.JWT_SECRET || 'supersecret', expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { secret: process.env.JWT_REFRESH_SECRET || 'superrefreshsecret', expiresIn: '7d' });
    await this.storeRefreshToken(userId, refreshToken);
    return { accessToken, refreshToken, user: { id: userId, email, role } };
  }
}
