import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthCodecService } from './auth-codec.service';
import { NexaAppCompatController } from './nexa-app-compat.controller';
import { NexaAppCompatService } from './nexa-app-compat.service';

const legacyOnly = process.env.NEXA_LEGACY_ONLY === 'true';

@Module({
  imports: legacyOnly ? [] : [PrismaModule],
  controllers: [NexaAppCompatController],
  providers: [AuthCodecService, NexaAppCompatService],
})
export class NexaAppCompatModule {}
