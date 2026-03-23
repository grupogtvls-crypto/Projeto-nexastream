import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { ActivateMacDto } from './dto/activate-mac.dto';
import { ChangeLicenseDto } from './dto/change-license.dto';

@UseGuards(JwtAuthGuard)
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  findAll() { return this.devicesService.findAll(); }

  @Get('me')
  findMine(@Req() req: any) { return this.devicesService.findByUser(req.user.userId); }

  @Post()
  create(@Body() dto: CreateDeviceDto) { return this.devicesService.create(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDeviceDto) { return this.devicesService.update(id, dto); }

  @Patch(':id/block')
  block(@Param('id') id: string) { return this.devicesService.block(id); }

  @Patch(':id/unblock')
  unblock(@Param('id') id: string) { return this.devicesService.unblock(id); }

  @Patch(':id/activate-mac')
  activateMac(@Param('id') id: string, @Body() dto: ActivateMacDto) { return this.devicesService.activateMac(id, dto.macAddress); }

  @Patch(':id/change-license')
  changeLicense(@Param('id') id: string, @Body() dto: ChangeLicenseDto) { return this.devicesService.changeLicense(id, dto.licenseId); }

  @Patch(':id/playlist')
  updatePlaylist(@Param('id') id: string, @Body() body: { playlistId: string }) { return this.devicesService.updatePlaylist(id, body.playlistId); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.devicesService.remove(id); }
}
