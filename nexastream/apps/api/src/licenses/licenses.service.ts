import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLicenseDto } from './dto/create-license.dto';
import { UpdateLicenseDto } from './dto/update-license.dto';

@Injectable()
export class LicensesService {
  constructor(private readonly prisma: PrismaService) {}
  findAll() { return this.prisma.license.findMany({ include: { user: true, devices: true }, orderBy: { createdAt: 'desc' } }); }
  create(dto: CreateLicenseDto) { return this.prisma.license.create({ data: { ...dto, startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined } }); }
  async update(id: string, dto: UpdateLicenseDto) { await this.ensureExists(id); return this.prisma.license.update({ where: { id }, data: { ...dto, startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined } }); }
  async replace(id: string, newKey: string) { await this.ensureExists(id); return this.prisma.license.update({ where: { id }, data: { key: newKey, status: 'REPLACED' } }); }
  async remove(id: string) { await this.ensureExists(id); return this.prisma.license.delete({ where: { id } }); }
  private async ensureExists(id: string) { const item = await this.prisma.license.findUnique({ where: { id } }); if (!item) throw new NotFoundException('Licença não encontrada'); return item; }
}
