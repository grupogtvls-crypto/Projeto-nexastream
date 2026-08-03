import { NextRequest, NextResponse } from 'next/server';
import { isIP } from 'node:net';
import { lookup } from 'node:dns/promises';

export const runtime = 'nodejs';

const ACTIONS = new Set([
  '', 'get_live_categories', 'get_live_streams', 'get_vod_categories',
  'get_vod_streams', 'get_series_categories', 'get_series', 'get_series_info',
]);

function privateIp(ip: string) {
  const value = ip.replace(/^::ffff:/, '');
  return /^(10\.|127\.|169\.254\.|192\.168\.|0\.)/.test(value)
    || /^172\.(1[6-9]|2\d|3[01])\./.test(value)
    || value === '::1' || value.startsWith('fc') || value.startsWith('fd') || value.startsWith('fe80:');
}

async function safeServer(raw: string) {
  const url = new URL(raw.includes('://') ? raw : `http://${raw}`);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Servidor inválido');
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.local') || (isIP(host) && privateIp(host))) throw new Error('Servidor não permitido');
  const addresses = await lookup(host, { all: true });
  if (!addresses.length || addresses.some(({ address }) => privateIp(address))) throw new Error('Servidor não permitido');
  return url;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const server = await safeServer(String(body.server || '').trim());
    const username = String(body.username || '').trim();
    const password = String(body.password || '');
    const action = String(body.action || '');
    if (!username || !password || !ACTIONS.has(action)) return NextResponse.json({ error: 'Dados de acesso inválidos' }, { status: 400 });

    server.pathname = `${server.pathname.replace(/\/$/, '')}/player_api.php`;
    server.search = '';
    server.searchParams.set('username', username);
    server.searchParams.set('password', password);
    if (action) server.searchParams.set('action', action);
    if (body.series_id) server.searchParams.set('series_id', String(body.series_id));
    if (body.category_id) server.searchParams.set('category_id', String(body.category_id));

    const upstream = await fetch(server, { signal: AbortSignal.timeout(20000), cache: 'no-store' });
    const text = await upstream.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { throw new Error('O servidor não retornou dados Xtream válidos'); }
    return NextResponse.json(data, { status: upstream.ok ? 200 : 502 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao conectar à lista';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
