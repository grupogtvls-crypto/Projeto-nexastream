import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SettingsService } from './settings.service';
import { UpdatePanelSettingsDto } from './dto/update-panel-settings.dto';

@UseGuards(JwtAuthGuard)
@Controller('settings/panel')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}
  @Get() getPanelSettings() { return this.settingsService.getPanelSettings(); }
  @Patch() updatePanelSettings(@Body() dto: UpdatePanelSettingsDto) { return this.settingsService.updatePanelSettings(dto); }
}
