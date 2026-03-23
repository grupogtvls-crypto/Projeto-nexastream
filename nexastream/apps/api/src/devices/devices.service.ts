import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.device.findMany({ include: { user: true, playlist: true, license: true }, orderBy: { createdAt: 'desc' } });
  }

  findByUser(userId: string) {
    return this.prisma.device.findMany({ where: { userId }, include: { playlist: true, license: true }, orderBy: { createdAt: 'desc' } });
  }

  create(dto: CreateDeviceDto) {
    return this.prisma.device.create({ data: dto });
  }

  async update(id: string, dto: UpdateDeviceDto) {
    await this.ensureExists(id);
    return this.prisma.device.update({ where: { id }, data: dto });
  }

  async block(id: string) {
    await this.ensureExists(id);
    return this.prisma.device.update({ where: { id }, data: { blocked: true, status: 'BLOCKED' } });
  }

  async unblock(id: string) {
    await this.ensureExists(id);
    return this.prisma.device.update({ where: { id }, data: { blocked: false, status: 'ACTIVE' } });
  }

  async activateMac(id: string, macAddress: string) {
    await this.ensureExists(id);
    return this.prisma.device.update({ where: { id }, data: { macActivated: true, macAddress, status: 'ACTIVE' } });
  }

  async changeLicense(id: string, licenseId: string) {
    await this.ensureExists(id);
    return this.prisma.device.update({ where: { id }, data: { licenseId }, include: { license: true } });
  }

  async updatePlaylist(id: string, playlistId: string) {
    await this.ensureExists(id);
    return this.prisma.device.update({ where: { id }, data: { playlistId }, include: { playlist: true } });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.device.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const device = await this.prisma.device.findUnique({ where: { id } });
    if (!device) throw new NotFoundException('Dispositivo não encontrado');
    return device;
  }
}
