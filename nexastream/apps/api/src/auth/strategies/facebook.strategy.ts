import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_APP_ID || '',
      clientSecret: process.env.FACEBOOK_APP_SECRET || '',
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || '',
      profileFields: ['id', 'displayName', 'emails'],
      scope: ['email'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    return {
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
      provider: 'facebook',
      providerId: profile.id,
    };
  }
}
