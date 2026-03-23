import { IsString } from 'class-validator';

export class ReplaceLicenseDto {
  @IsString()
  newKey: string;
}
