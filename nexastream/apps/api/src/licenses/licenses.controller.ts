import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LicensesService } from './licenses.service';
import { CreateLicenseDto } from './dto/create-license.dto';
import { UpdateLicenseDto } from './dto/update-license.dto';
import { ReplaceLicenseDto } from './dto/replace-license.dto';

@UseGuards(JwtAuthGuard)
@Controller('licenses')
export class LicensesController {
  constructor(private readonly licensesService: LicensesService) {}
  @Get() findAll() { return this.licensesService.findAll(); }
  @Post() create(@Body() dto: CreateLicenseDto) { return this.licensesService.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateLicenseDto) { return this.licensesService.update(id, dto); }
  @Patch(':id/replace') replace(@Param('id') id: string, @Body() dto: ReplaceLicenseDto) { return this.licensesService.replace(id, dto.newKey); }
  @Delete(':id') remove(@Param('id') id: string) { return this.licensesService.remove(id); }
}
