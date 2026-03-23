import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateLicenseDto {
  @IsString()
  key: string;

  @IsInt() @Min(1)
  durationDays: number;

  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsDateString() expiresAt?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() userId?: string;
}
