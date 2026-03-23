import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';

@UseGuards(JwtAuthGuard)
@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}
  @Get() findAll() { return this.playlistsService.findAll(); }
  @Post() create(@Body() dto: CreatePlaylistDto) { return this.playlistsService.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdatePlaylistDto) { return this.playlistsService.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.playlistsService.remove(id); }
}
