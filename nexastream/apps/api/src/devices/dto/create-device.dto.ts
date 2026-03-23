import { IsOptional, IsString } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  deviceCode: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  platform: string;

  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  playlistId?: string;

  @IsOptional()
  @IsString()
  licenseId?: string;
}
