import { IsString } from 'class-validator';

export class ActivateMacDto {
  @IsString()
  macAddress: string;
}
