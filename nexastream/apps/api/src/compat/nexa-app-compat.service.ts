import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AuthCodecService } from './auth-codec.service';

type DeviceWithRelations = Awaited<ReturnType<PrismaService['device']['findFirst']>>;

@Injectable()
export class NexaAppCompatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly codec: AuthCodecService,
  ) {}

  async auth(body: Record<string, any>, req: Request) {
    const decoded = this.codec.decode(body?.data);
    const macAddress = this.normalizeMac(
      body?.mac_address ||
        body?.mac ||
        decoded?.mac_address ||
        decoded?.mac ||
        decoded?.device_id ||
        req.headers['x-mac-address'] ||
        req.headers['x-device-id'] ||
        '00:00:00:00:00:00',
    );

    const version = String(decoded?.version || body?.version || req.headers['x-version'] || '350');
    const deviceType = String(decoded?.device_type || body?.device_type || 'Android');
    const device = await this.ensureDevice(macAddress, deviceType);
    const playlist = await this.resolvePlaylist(device as any);
    const expiresAt = this.resolveDeviceExpiration(device as any);
    const isPaid = this.isPaidDevice(device as any, expiresAt);

    const payload = {
      success: true,
      app_name: 'NexaStream',
      package_name: process.env.NEXA_APP_PACKAGE || 'iptv.nexa.stream',
      version,
      version_code: '350',
      force_update: false,
      is_paid: isPaid,
      is_trial: !isPaid,
      device_id: macAddress,
      mac_address: macAddress,
      device_key: (device as any).deviceCode,
      device_code: (device as any).deviceCode,
      device_type: deviceType,
      status: (device as any).blocked ? 'blocked' : (expiresAt.getTime() < Date.now() ? 'expired' : 'active'),
      created_at: this.toUnix((device as any).createdAt),
      expire_date: this.toUnix(expiresAt),
      expiry_date: this.toUnix(expiresAt),
      playlist_name: playlist?.name || 'NexaStream Demo',
      current_playlist: playlist?.name || 'NexaStream Demo',
      current_playlist_expires: this.toUnix(expiresAt),
      user_agent: process.env.NEXA_STREAM_USER_AGENT || 'Vivo Player',
      language: 'en',
      default_language: 'en',
      languages: this.languages(),
      home: this.homeBlock(),
      settings: this.settingsBlock(),
      messages: this.messageBlock(),
      xtream: this.xtreamBlock(playlist),
      api: {
        auth: '/auth',
        player_api: '/player_api.php',
        update_pin: '/update_pin',
        validation: '/tb/a',
      },
    };

    return {
      id: String((device as any).id || macAddress),
      data: this.codec.encode(payload),
      success: true,
    };
  }

  validation() {
    return { success: true, valid: true, status: 'active', app: 'NexaStream' };
  }

  updatePin(body: Record<string, any>) {
    return { success: true, result: true, message: 'PIN updated', data: body ?? {} };
  }

  async playerApi(query: Record<string, any>, req: Request) {
    const action = String(query?.action || 'get_user_info');
    const playlist = await this.resolvePlaylistByCredentials(query);
    const serverInfo = this.serverInfo(playlist, req);

    if (!action || action === 'get_user_info') {
      return {
        user_info: this.userInfo(query),
        server_info: serverInfo,
      };
    }

    switch (action) {
      case 'get_live_categories':
      case 'get_vod_categories':
      case 'get_series_categories':
        return this.defaultCategories(action);
      case 'get_live_streams':
        return this.defaultLiveStreams(serverInfo);
      case 'get_vod_streams':
        return this.defaultVodStreams(serverInfo);
      case 'get_series':
        return this.defaultSeries(serverInfo);
      case 'get_series_info':
        return this.defaultSeriesInfo(serverInfo, Number(query?.series_id || 1));
      case 'get_simple_data_table':
        return this.simpleDataTable(Number(query?.stream_id || query?.id || 1));
      case 'get_short_epg':
      case 'get_simple_data_table_live':
        return this.simpleDataTable(Number(query?.stream_id || query?.id || 1));
      default:
        return [];
    }
  }

  private async ensureDevice(macAddress: string, platform: string) {
    const customer = await this.prisma.user.upsert({
      where: { email: process.env.NEXA_DEVICE_USER_EMAIL || 'devices@nexastream.local' },
      update: {},
      create: {
        name: 'NexaStream Device',
        email: process.env.NEXA_DEVICE_USER_EMAIL || 'devices@nexastream.local',
        role: 'CUSTOMER',
      },
    });

    const existing = await this.prisma.device.findFirst({
      where: { OR: [{ macAddress }, { deviceCode: macAddress }] },
      include: { playlist: true, license: true },
    });

    if (existing) return existing;

    const deviceCode = await this.generateDeviceCode();
    return this.prisma.device.create({
      data: {
        deviceCode,
        name: `NexaStream ${macAddress}`,
        platform,
        macAddress,
        macActivated: true,
        status: 'ACTIVE',
        blocked: false,
        userId: customer.id,
      },
      include: { playlist: true, license: true },
    });
  }

  private async generateDeviceCode() {
    for (let i = 0; i < 20; i++) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const found = await this.prisma.device.findUnique({ where: { deviceCode: code } });
      if (!found) return code;
    }
    return String(Date.now()).slice(-6);
  }

  private async resolvePlaylist(device?: NonNullable<DeviceWithRelations>) {
    if ((device as any)?.playlist) return (device as any).playlist;
    return this.prisma.playlist.findFirst({ where: { active: true }, orderBy: { createdAt: 'desc' } });
  }

  private async resolvePlaylistByCredentials(query: Record<string, any>) {
    const username = query?.username ? String(query.username) : undefined;
    const password = query?.password ? String(query.password) : undefined;

    if (username && password) {
      const byCredentials = await this.prisma.playlist.findFirst({
        where: { username, password, active: true },
        orderBy: { createdAt: 'desc' },
      });
      if (byCredentials) return byCredentials;
    }

    return this.prisma.playlist.findFirst({ where: { active: true }, orderBy: { createdAt: 'desc' } });
  }

  private resolveDeviceExpiration(device: any) {
    if (device?.license?.expiresAt) return new Date(device.license.expiresAt);
    const createdAt = device?.createdAt ? new Date(device.createdAt) : new Date();
    const trialDays = Number(process.env.NEXA_TRIAL_DAYS || 15);
    return new Date(createdAt.getTime() + trialDays * 24 * 60 * 60 * 1000);
  }

  private isPaidDevice(device: any, expiresAt: Date) {
    return Boolean(device?.license?.status === 'ACTIVE' && expiresAt.getTime() > Date.now());
  }

  private userInfo(query: Record<string, any>) {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + Number(process.env.NEXA_DEFAULT_DAYS || 365) * 86400;
    return {
      username: String(query?.username || process.env.NEXA_DEMO_USERNAME || 'demo'),
      password: String(query?.password || process.env.NEXA_DEMO_PASSWORD || 'demo'),
      message: 'NexaStream active',
      auth: 1,
      status: 'Active',
      exp_date: String(exp),
      is_trial: '0',
      active_cons: '0',
      created_at: String(now),
      max_connections: '1',
      allowed_output_formats: ['m3u8', 'ts'],
    };
  }

  private serverInfo(playlist: any, req: Request) {
    const source = playlist?.host || playlist?.sourceUrl || process.env.NEXA_DEMO_HOST || `${req.protocol}://${req.get('host')}`;
    const url = new URL(source.startsWith('http') ? source : `http://${source}`);
    return {
      url: url.hostname,
      port: url.port || (url.protocol === 'https:' ? '443' : '80'),
      https_port: '443',
      server_protocol: url.protocol.replace(':', ''),
      rtmp_port: '8880',
      timezone: 'America/Fortaleza',
      timestamp_now: Math.floor(Date.now() / 1000),
      time_now: new Date().toISOString(),
    };
  }

  private xtreamBlock(playlist: any) {
    return {
      name: playlist?.name || 'NexaStream Demo',
      host: playlist?.host || process.env.NEXA_DEMO_HOST || '',
      username: playlist?.username || process.env.NEXA_DEMO_USERNAME || 'demo',
      password: playlist?.password || process.env.NEXA_DEMO_PASSWORD || 'demo',
      source_url: playlist?.sourceUrl || process.env.NEXA_DEMO_M3U || '',
      source_type: playlist?.sourceType || 'xtream',
    };
  }

  private defaultCategories(action: string) {
    const type = action.includes('live') ? 'Live TV' : action.includes('vod') ? 'Movies' : 'Series';
    return [{ category_id: '1', category_name: type, parent_id: 0 }];
  }

  private defaultLiveStreams(serverInfo: any) {
    return [
      {
        num: 1,
        name: 'NexaStream Demo Live',
        stream_type: 'live',
        stream_id: 1,
        stream_icon: '',
        epg_channel_id: 'nexastream.demo',
        added: String(Math.floor(Date.now() / 1000)),
        category_id: '1',
        custom_sid: '',
        tv_archive: 0,
        direct_source: this.demoStream(serverInfo),
        tv_archive_duration: 0,
      },
    ];
  }

  private defaultVodStreams(serverInfo: any) {
    return [
      {
        num: 1,
        name: 'NexaStream Demo Movie',
        stream_type: 'movie',
        stream_id: 1001,
        stream_icon: '',
        rating: '0',
        added: String(Math.floor(Date.now() / 1000)),
        category_id: '1',
        container_extension: 'mp4',
        custom_sid: '',
        direct_source: this.demoStream(serverInfo),
      },
    ];
  }

  private defaultSeries(serverInfo: any) {
    return [
      {
        num: 1,
        name: 'NexaStream Demo Series',
        series_id: 2001,
        cover: '',
        plot: 'NexaStream demo series',
        cast: '',
        director: '',
        genre: 'Demo',
        releaseDate: '',
        last_modified: String(Math.floor(Date.now() / 1000)),
        rating: '0',
        category_id: '1',
        youtube_trailer: '',
        backdrop_path: [],
        direct_source: this.demoStream(serverInfo),
      },
    ];
  }

  private defaultSeriesInfo(serverInfo: any, seriesId: number) {
    return {
      info: { name: 'NexaStream Demo Series', cover: '', plot: 'NexaStream demo series', genre: 'Demo', rating: '0' },
      episodes: {
        1: [
          {
            id: 3001,
            episode_num: 1,
            title: 'Episode 1',
            container_extension: 'mp4',
            info: { movie_image: '', plot: 'Demo episode' },
            direct_source: this.demoStream(serverInfo),
          },
        ],
      },
      seasons: [{ air_date: '', episode_count: 1, id: 1, name: 'Season 1', season_number: 1 }],
      series_id: seriesId,
    };
  }

  private simpleDataTable(streamId: number) {
    const now = Math.floor(Date.now() / 1000);
    return {
      epg_listings: [
        {
          id: streamId,
          epg_id: streamId,
          title: Buffer.from('NexaStream Demo').toString('base64'),
          lang: 'en',
          start: new Date(now * 1000).toISOString(),
          end: new Date((now + 3600) * 1000).toISOString(),
          description: Buffer.from('NexaStream programme').toString('base64'),
          channel_id: 'nexastream.demo',
          start_timestamp: now,
          stop_timestamp: now + 3600,
        },
      ],
    };
  }

  private demoStream(serverInfo: any) {
    return process.env.NEXA_DEMO_STREAM || `${serverInfo.server_protocol}://${serverInfo.url}:${serverInfo.port}/live/demo/demo/1.m3u8`;
  }

  private homeBlock() {
    return {
      live_tv: 'Live TV',
      movies: 'Movies',
      series: 'Series',
      catch_up: 'Catch Up',
      favorites: 'Favorites',
      playlists: 'Playlists',
      current_playlist: 'Current Playlist',
      current_playlist_expires: 'Current Playlist expires',
    };
  }

  private settingsBlock() {
    return {
      built_in_player_settings: 'Built-in Player Settings',
      hardware_decoder: 'Hardware Decoder',
      automatic: 'Automatic',
      auto_update_everytime: 'AUTO-UPDATE LIVE,MOVIE & SERIES EVERYTIME',
      auto_update_everyday: 'AUTO-UPDATE LIVE,MOVIE & SERIES EVERYDAY',
      auto_update_after_2_days: 'AUTO-UPDATE LIVE,MOVIE & SERIES AFTER 2 DAYS',
      live_channel_settings: 'Live Channel Settings',
      live_stream_format: 'Live Stream Format',
      default: 'DEFAULT',
      live_channel_sort: 'Live Channel Sort',
      order_a_z: 'ORDER BY A-Z',
      order_z_a: 'ORDER BY Z-A',
      show_hide_archive_icon: 'Show/Hide Archive Ícone',
      general_settings: 'General Settings',
      autostart_on_bootup: 'AutoStart on Bootup',
      user_agent: 'User Agente',
      parental_control: 'Parental Control',
      password: 'Password',
      new_password: 'New Password',
      confirm_password: 'Confirm Password',
      update_notes: 'You Version is up to date.',
      clear_cache: 'Clear Cache',
      hide_series_categories: 'Hide Séries Categorias',
      hide_vod_categories: 'Hide Vod Categorias',
      hide_live_categories: 'Hide Live Categorias',
      favorite: 'FAVORITE',
      resume_to_watch: 'RESUME TO WATCH',
    };
  }

  private messageBlock() {
    return {
      exit_title: 'Exit',
      exit_message: 'Click Yes to exit the app. Click No to cancel.',
      yes: 'Yes',
      no: 'No',
      no_connection: 'No connection',
      account: 'User Account',
      device_key: 'Device Key',
      expire_date: 'Expire Date',
      playlist_expiry_date: 'Playlist Expiry Date',
    };
  }

  private languages() {
    return [{ code: 'en', name: 'English', default: true }];
  }

  private toUnix(value: Date) {
    return Math.floor(new Date(value).getTime() / 1000);
  }

  private normalizeMac(value: unknown) {
    const raw = String(value || '').trim();
    if (!raw) return '00:00:00:00:00:00';
    return raw.toUpperCase();
  }
}
