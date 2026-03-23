import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreatePlaylistDto {
  @IsString()
  name: string;

  @IsString()
  sourceType: string;

  @IsOptional() @IsString() sourceUrl?: string;
  @IsOptional() @IsString() username?: string;
  @IsOptional() @IsString() password?: string;
  @IsOptional() @IsString() host?: string;
  @IsOptional() @IsBoolean() active?: boolean;
}
