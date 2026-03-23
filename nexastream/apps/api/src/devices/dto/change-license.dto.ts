import { IsString } from 'class-validator';

export class ChangeLicenseDto {
  @IsString()
  licenseId: string;
}
