import { All, Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { NexaAppCompatService } from './nexa-app-compat.service';

@Controller()
export class NexaAppCompatController {
  constructor(private readonly compat: NexaAppCompatService) {}

  @Post('auth')
  auth(@Body() body: Record<string, any>, @Req() req: Request) {
    return this.compat.auth(body || {}, req);
  }

  @All('tb/a')
  validation() {
    return this.compat.validation();
  }

  @Post('update_pin')
  updatePin(@Body() body: Record<string, any>) {
    return this.compat.updatePin(body || {});
  }

  @Get('player_api.php')
  playerApi(@Query() query: Record<string, any>, @Req() req: Request) {
    return this.compat.playerApi(query || {}, req);
  }
}
