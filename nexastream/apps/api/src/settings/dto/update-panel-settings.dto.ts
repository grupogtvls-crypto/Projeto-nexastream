import { IsBoolean, IsHexColor, IsOptional, IsString } from 'class-validator';

export class UpdatePanelSettingsDto {
  @IsOptional() @IsString() panelName?: string;
  @IsOptional() @IsString() logoUrl?: string;
  @IsOptional() @IsHexColor() primaryColor?: string;
  @IsOptional() @IsBoolean() maintenance?: boolean;
}
