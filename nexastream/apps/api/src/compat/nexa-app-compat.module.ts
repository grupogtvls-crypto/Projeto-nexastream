import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthCodecService } from './auth-codec.service';
import { NexaAppCompatController } from './nexa-app-compat.controller';
import { NexaAppCompatService } from './nexa-app-compat.service';

@Module({
  imports: [PrismaModule],
  controllers: [NexaAppCompatController],
  providers: [AuthCodecService, NexaAppCompatService],
})
export class NexaAppCompatModule {}
