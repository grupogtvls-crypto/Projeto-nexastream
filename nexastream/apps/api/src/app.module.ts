import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DevicesModule } from './devices/devices.module';
import { UsersModule } from './users/users.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { LicensesModule } from './licenses/licenses.module';
import { SettingsModule } from './settings/settings.module';
import { UploadsModule } from './uploads/uploads.module';
import { NexaAppCompatModule } from './compat/nexa-app-compat.module';

const legacyOnly = process.env.NEXA_LEGACY_ONLY === 'true';

@Module({
  imports: legacyOnly
    ? [
        ConfigModule.forRoot({ isGlobal: true }),
        NexaAppCompatModule,
      ]
    : [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        NexaAppCompatModule,
        AuthModule,
        DevicesModule,
        UsersModule,
        PlaylistsModule,
        LicensesModule,
        SettingsModule,
        UploadsModule,
      ],
})
export class AppModule {}
