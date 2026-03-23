import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePanelSettingsDto } from './dto/update-panel-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}
  async getPanelSettings() { return (await this.prisma.panelSetting.findFirst()) || this.prisma.panelSetting.create({ data: {} }); }
  async updatePanelSettings(dto: UpdatePanelSettingsDto) {
    const existing = await this.prisma.panelSetting.findFirst();
    if (!existing) return this.prisma.panelSetting.create({ data: dto });
    return this.prisma.panelSetting.update({ where: { id: existing.id }, data: dto });
  }
}
