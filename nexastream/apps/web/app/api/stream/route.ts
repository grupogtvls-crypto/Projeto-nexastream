import { NextRequest, NextResponse } from 'next/server';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

export const runtime = 'nodejs';

function privateIp(ip: string) {
  const value = ip.replace(/^::ffff:/, '');
  return /^(10\.|127\.|169\.254\.|192\.168\.|0\.)/.test(value)
    || /^172\.(1[6-9]|2\d|3[01])\./.test(value)
    || value === '::1' || value.startsWith('fc') || value.startsWith('fd') || value.startsWith('fe80:');
}

async function checkedUrl(raw: string) {
  const url = new URL(raw);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('URL inválida');
  if (url.hostname === 'localhost' || (isIP(url.hostname) && privateIp(url.hostname))) throw new Error('Destino não permitido');
  const addresses = await lookup(url.hostname, { all: true });
  if (!addresses.length || addresses.some(({ address }) => privateIp(address))) throw new Error('Destino não permitido');
  return url;
}

function proxied(url: URL, request: NextRequest) {
  return `${request.nextUrl.origin}/api/stream?url=${encodeURIComponent(url.toString())}`;
}

function rewriteManifest(manifest: string, base: URL, request: NextRequest) {
  const absolute = (value: string) => proxied(new URL(value, base), request);
  return manifest
    .replace(/URI="([^"]+)"/g, (_, uri) => `URI="${absolute(uri)}"`)
    .split('\n')
    .map((line) => line.trim() && !line.startsWith('#') ? absolute(line.trim()) : line)
    .join('\n');
}

export async function GET(request: NextRequest) {
  try {
    const target = await checkedUrl(request.nextUrl.searchParams.get('url') || '');
    const headers: HeadersInit = { 'user-agent': 'NexaStream-Web/1.0', accept: '*/*' };
    const range = request.headers.get('range');
    if (range) headers.range = range;
    const upstream = await fetch(target, { headers, redirect: 'follow', signal: AbortSignal.timeout(30000), cache: 'no-store' });
    const type = upstream.headers.get('content-type') || '';
    const isManifest = type.includes('mpegurl') || target.pathname.toLowerCase().endsWith('.m3u8');
    if (isManifest) {
      const body = rewriteManifest(await upstream.text(), target, request);
      return new NextResponse(body, { status: upstream.status, headers: { 'content-type': 'application/vnd.apple.mpegurl', 'cache-control': 'no-store' } });
    }
    const responseHeaders = new Headers();
    ['content-type', 'content-length', 'content-range', 'accept-ranges'].forEach((name) => {
      const value = upstream.headers.get(name); if (value) responseHeaders.set(name, value);
    });
    responseHeaders.set('cache-control', 'no-store');
    return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Falha na transmissão' }, { status: 502 });
  }
}
