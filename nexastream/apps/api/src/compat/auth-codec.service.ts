import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthCodecService {
  private readonly standardAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  encode(payload: unknown): string {
    const json = JSON.stringify(payload);
    const mode = (process.env.NEXA_AUTH_ENCODING || 'base64').toLowerCase();

    if (mode === 'plain' || mode === 'raw') return json;

    const base64 = Buffer.from(json, 'utf8').toString('base64');

    if (mode === 'base64url') {
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    }

    const customAlphabet = process.env.NEXA_AUTH_ALPHABET;
    if (customAlphabet && customAlphabet.length >= 64) {
      return this.translateAlphabet(base64, this.standardAlphabet, customAlphabet.slice(0, 64));
    }

    return base64;
  }

  decode(value?: string): Record<string, any> {
    if (!value) return {};

    const candidates = [value];
    const customAlphabet = process.env.NEXA_AUTH_ALPHABET;
    if (customAlphabet && customAlphabet.length >= 64) {
      candidates.unshift(this.translateAlphabet(value, customAlphabet.slice(0, 64), this.standardAlphabet));
    }
    candidates.push(value.replace(/-/g, '+').replace(/_/g, '/'));

    for (const candidate of candidates) {
      try {
        const normalized = candidate.padEnd(candidate.length + ((4 - (candidate.length % 4)) % 4), '=');
        const parsed = JSON.parse(Buffer.from(normalized, 'base64').toString('utf8'));
        if (parsed && typeof parsed === 'object') return parsed;
      } catch {}
    }

    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {}

    return {};
  }

  private translateAlphabet(input: string, from: string, to: string): string {
    return input
      .split('')
      .map((char) => {
        const index = from.indexOf(char);
        return index >= 0 ? to[index] : char;
      })
      .join('');
  }
}
