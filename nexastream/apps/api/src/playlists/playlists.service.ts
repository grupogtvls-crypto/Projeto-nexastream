import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';

@Injectable()
export class PlaylistsService {
  constructor(private readonly prisma: PrismaService) {}
  findAll() { return this.prisma.playlist.findMany({ include: { devices: true }, orderBy: { createdAt: 'desc' } }); }
  create(dto: CreatePlaylistDto) { return this.prisma.playlist.create({ data: { ...dto, active: dto.active ?? true } }); }
  async update(id: string, dto: UpdatePlaylistDto) { await this.ensureExists(id); return this.prisma.playlist.update({ where: { id }, data: dto }); }
  async remove(id: string) { await this.ensureExists(id); return this.prisma.playlist.delete({ where: { id } }); }
  private async ensureExists(id: string) { const item = await this.prisma.playlist.findUnique({ where: { id } }); if (!item) throw new NotFoundException('Lista não encontrada'); return item; }
}
